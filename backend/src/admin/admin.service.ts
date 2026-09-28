import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStockDashboard() {
    const products = await this.prisma.product.findMany({
      orderBy: { stockQty: 'asc' },
    });

    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.isActive).length;
    const lowStockCount = products.filter((p) => p.isActive && p.stockQty > 0 && p.stockQty <= 10).length;
    const outOfStockCount = products.filter((p) => p.isActive && p.stockQty === 0).length;
    const totalInventoryValue = products.reduce((acc, p) => acc + p.stockQty * p.price, 0);

    return {
      summary: {
        totalProducts,
        activeProducts,
        lowStockCount,
        outOfStockCount,
        totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      },
      products: products.map((prod) => ({
        ...prod,
        stockStatus:
          prod.stockQty <= 0
            ? 'OUT_OF_STOCK'
            : prod.stockQty <= 10
              ? 'LOW_STOCK'
              : 'IN_STOCK',
      })),
    };
  }

  async getAuditLogs(limit: number = 50) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async getStockLogs(limit: number = 50) {
    return this.prisma.stockLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        order: { select: { id: true, poNumber: true } },
      },
    });
  }
}
