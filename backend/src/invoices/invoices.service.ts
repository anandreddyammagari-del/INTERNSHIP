import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findByOrderId(orderId: string, user: AuthUser) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            company: true,
            user: { select: { id: true, name: true, email: true } },
            items: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice for order ID "${orderId}" not found`);
    }

    if (user.role === 'BUYER' && invoice.order.companyId !== user.companyId) {
      throw new ForbiddenException(
        'Access denied: You cannot view invoices from another company',
      );
    }

    return invoice;
  }
}
