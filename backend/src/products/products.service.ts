import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProductDto, AdjustStockDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { search?: string; category?: string; includeInactive?: boolean }) {
    const where: any = {};

    if (!query?.includeInactive) {
      where.isActive = true;
    }

    if (query?.category && query.category !== 'All') {
      where.category = query.category;
    }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search } },
        { sku: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return products.map((prod) => ({
      ...prod,
      stockStatus:
        prod.stockQty <= 0
          ? 'OUT_OF_STOCK'
          : prod.stockQty <= 10
            ? 'LOW_STOCK'
            : 'IN_STOCK',
    }));
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return {
      ...product,
      stockStatus:
        product.stockQty <= 0
          ? 'OUT_OF_STOCK'
          : product.stockQty <= 10
            ? 'LOW_STOCK'
            : 'IN_STOCK',
    };
  }

  async update(id: string, dto: UpdateProductDto, adminId: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: dto,
    });

    // If stock was directly updated
    if (dto.stockQty !== undefined && dto.stockQty !== existing.stockQty) {
      const delta = dto.stockQty - existing.stockQty;
      await this.prisma.stockLog.create({
        data: {
          productId: id,
          delta,
          reason: 'MANUAL_CORRECTION',
        },
      });
    }

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'PRODUCT_UPDATED',
        entity: 'Product',
        entityId: id,
        details: JSON.stringify({
          before: { price: existing.price, stockQty: existing.stockQty },
          after: { price: updated.price, stockQty: updated.stockQty },
        }),
      },
    });

    return updated;
  }

  async adjustStock(id: string, dto: AdjustStockDto, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id } });
      if (!product) {
        throw new NotFoundException(`Product with ID "${id}" not found`);
      }

      const newQty = product.stockQty + dto.delta;
      if (newQty < 0) {
        throw new BadRequestException(
          `Cannot reduce stock by ${Math.abs(dto.delta)}. Current stock is ${product.stockQty}.`,
        );
      }

      const updated = await tx.product.update({
        where: { id },
        data: { stockQty: newQty },
      });

      await tx.stockLog.create({
        data: {
          productId: id,
          delta: dto.delta,
          reason: dto.reason,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: 'STOCK_ADJUSTED',
          entity: 'Product',
          entityId: id,
          details: JSON.stringify({
            delta: dto.delta,
            reason: dto.reason,
            prevStock: product.stockQty,
            newStock: newQty,
          }),
        },
      });

      return updated;
    });
  }

  async softDelete(id: string, adminId: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    const deleted = await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'PRODUCT_DEACTIVATED',
        entity: 'Product',
        entityId: id,
        details: JSON.stringify({ name: existing.name, sku: existing.sku }),
      },
    });

    return deleted;
  }
}
