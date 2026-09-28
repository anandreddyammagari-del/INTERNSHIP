import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('ProductsService (Stock & Pricing Unit Tests)', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            stockLog: {
              create: jest.fn(),
            },
            auditLog: {
              create: jest.fn(),
            },
            $transaction: jest.fn((cb) => cb(prisma)),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should correctly calculate IN_STOCK, LOW_STOCK, and OUT_OF_STOCK statuses', async () => {
    jest.spyOn(prisma.product, 'findMany').mockResolvedValue([
      { id: '1', sku: 'S1', name: 'P1', price: 10, stockQty: 50, isActive: true },
      { id: '2', sku: 'S2', name: 'P2', price: 20, stockQty: 4, isActive: true },
      { id: '3', sku: 'S3', name: 'P3', price: 30, stockQty: 0, isActive: true },
    ] as any);

    const result = await service.findAll();
    expect(result[0].stockStatus).toBe('IN_STOCK');
    expect(result[1].stockStatus).toBe('LOW_STOCK');
    expect(result[2].stockStatus).toBe('OUT_OF_STOCK');
  });

  it('should reject stock adjustment that results in negative quantity', async () => {
    jest.spyOn(prisma.product, 'findUnique').mockResolvedValue({
      id: 'prod-1',
      stockQty: 5,
    } as any);

    await expect(
      service.adjustStock(
        'prod-1',
        { delta: -10, reason: 'DAMAGE_WRITE_OFF' },
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
