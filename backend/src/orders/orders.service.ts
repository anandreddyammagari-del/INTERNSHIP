import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto, UpdateOrderStatusDto } from './dto/order.dto';
import { AuthUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async checkout(user: AuthUser, dto: CheckoutDto) {
    if (!user.companyId) {
      throw new BadRequestException('User must belong to a company to place an order');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch current open cart
      const cart = await tx.cart.findFirst({
        where: { userId: user.userId, status: 'OPEN' },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cannot checkout with an empty cart');
      }

      // 2. Validate stock for every item atomically
      let subtotal = 0;
      for (const item of cart.items) {
        // Fetch fresh product record within transaction to prevent race conditions
        const freshProduct = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!freshProduct || !freshProduct.isActive) {
          throw new BadRequestException(
            `Product "${item.product.name}" is no longer available`,
          );
        }

        if (freshProduct.stockQty < item.qty) {
          throw new BadRequestException(
            `Insufficient stock for "${freshProduct.name}". Available: ${freshProduct.stockQty}, requested: ${item.qty}`,
          );
        }

        subtotal += item.qty * freshProduct.price;
      }

      const totalAmount = Number(subtotal.toFixed(2));
      const company = await tx.company.findUnique({ where: { id: user.companyId } });
      const paymentTerms = dto.paymentTerms || company?.creditTerms || 'Net 30';

      // 3. Create Order
      const order = await tx.order.create({
        data: {
          companyId: user.companyId,
          userId: user.userId,
          status: 'PENDING',
          totalAmount,
          poNumber: dto.poNumber || `PO-${Date.now().toString().slice(-6)}`,
          paymentTerms,
        },
      });

      // 4. Create OrderItems with unitPriceSnapshot, decrement stock, and log stock changes
      for (const item of cart.items) {
        const freshProduct = await tx.product.findUnique({
          where: { id: item.productId },
        });

        // Create snapshot item
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            qty: item.qty,
            unitPriceSnapshot: freshProduct.price, // Price snapshot
          },
        });

        // Decrement stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: freshProduct.stockQty - item.qty },
        });

        // Write stock deduction log
        await tx.stockLog.create({
          data: {
            productId: item.productId,
            delta: -item.qty,
            reason: 'ORDER_DEDUCTION',
            refOrderId: order.id,
          },
        });
      }

      // 5. Generate Invoice
      const invoiceCount = await tx.invoice.count();
      const currentYear = new Date().getFullYear();
      const invoiceNumber = `INV-${currentYear}-${String(invoiceCount + 1).padStart(4, '0')}`;

      const dueDate = new Date();
      if (paymentTerms === 'Net 60') {
        dueDate.setDate(dueDate.getDate() + 60);
      } else if (paymentTerms === 'Net 30') {
        dueDate.setDate(dueDate.getDate() + 30);
      } else {
        dueDate.setDate(dueDate.getDate() + 7);
      }

      const taxAmount = Number((totalAmount * 0.18).toFixed(2));
      const grandTotal = Number((totalAmount + taxAmount).toFixed(2));

      const invoice = await tx.invoice.create({
        data: {
          orderId: order.id,
          invoiceNumber,
          dueDate,
          subtotal: totalAmount,
          taxAmount,
          totalAmount: grandTotal,
          status: 'UNPAID',
        },
      });

      // 6. Convert cart and create a new open cart
      await tx.cart.update({
        where: { id: cart.id },
        data: { status: 'CONVERTED' },
      });

      await tx.cart.create({
        data: {
          userId: user.userId,
          status: 'OPEN',
        },
      });

      // 7. Write Audit Log
      await tx.auditLog.create({
        data: {
          actorId: user.userId,
          action: 'ORDER_CREATED',
          entity: 'Order',
          entityId: order.id,
          details: JSON.stringify({
            orderId: order.id,
            poNumber: order.poNumber,
            totalAmount: grandTotal,
            invoiceNumber,
          }),
        },
      });

      return {
        orderId: order.id,
        status: order.status,
        poNumber: order.poNumber,
        totalAmount,
        grandTotal,
        invoiceNumber,
        message: 'Order placed successfully',
      };
    });
  }

  async findAll(user: AuthUser) {
    const where: any = {};

    // Multi-tenant check: BUYER can only see their company's orders
    if (user.role === 'BUYER') {
      if (!user.companyId) {
        return [];
      }
      where.companyId = user.companyId;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        company: true,
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: { product: true },
        },
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        company: true,
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: { product: true },
        },
        invoice: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    // Edge case check: Cross-company access isolation
    if (user.role === 'BUYER' && order.companyId !== user.companyId) {
      throw new ForbiddenException(
        'Access denied: You cannot view orders placed by another company',
      );
    }

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, actor: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    const currentStatus = order.status;
    const targetStatus = dto.status;

    // Strict state machine validation
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['FULFILLED', 'CANCELLED'],
      FULFILLED: [], // terminal
      CANCELLED: [], // terminal
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid status transition from "${currentStatus}" to "${targetStatus}". Allowed: [${allowed.join(', ')}]`,
      );
    }

    // If transitioning to CANCELLED, restock the inventory
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status: targetStatus },
      });

      if (targetStatus === 'CANCELLED') {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQty: { increment: item.qty } },
          });

          await tx.stockLog.create({
            data: {
              productId: item.productId,
              delta: item.qty,
              reason: 'RESTOCK',
              refOrderId: order.id,
            },
          });
        }

        // Void invoice if present
        await tx.invoice.updateMany({
          where: { orderId: id },
          data: { status: 'VOID' },
        });
      } else if (targetStatus === 'FULFILLED') {
        // Mark invoice as PAID
        await tx.invoice.updateMany({
          where: { orderId: id },
          data: { status: 'PAID' },
        });
      }

      // Record AuditLog
      await tx.auditLog.create({
        data: {
          actorId: actor.userId,
          action: 'ORDER_STATUS_CHANGED',
          entity: 'Order',
          entityId: id,
          details: JSON.stringify({
            from: currentStatus,
            to: targetStatus,
            actorRole: actor.role,
          }),
        },
      });

      return updated;
    });
  }
}
