import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('OrdersService (Business Logic Unit Tests)', () => {
  let service: OrdersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
            product: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            cart: {
              findFirst: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
            $transaction: jest.fn((cb) => cb(prisma)),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('Order State Machine Transitions', () => {
    it('should reject out-of-sequence transition from PENDING directly to FULFILLED', async () => {
      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
        id: 'order-123',
        status: 'PENDING',
        items: [],
      } as any);

      await expect(
        service.updateStatus(
          'order-123',
          { status: 'FULFILLED' },
          { userId: 'admin-1', email: 'admin@distributor.com', role: 'ADMIN', name: 'Admin' },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow valid transition from PENDING to CONFIRMED', async () => {
      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
        id: 'order-123',
        status: 'PENDING',
        items: [],
      } as any);

      const updateSpy = jest.spyOn(prisma.order, 'update').mockResolvedValue({
        id: 'order-123',
        status: 'CONFIRMED',
      } as any);

      const auditSpy = jest.fn().mockResolvedValue({});
      (prisma as any).auditLog = { create: auditSpy };

      const result = await service.updateStatus(
        'order-123',
        { status: 'CONFIRMED' },
        { userId: 'admin-1', email: 'admin@distributor.com', role: 'ADMIN', name: 'Admin' },
      );

      expect(result.status).toBe('CONFIRMED');
      expect(updateSpy).toHaveBeenCalled();
    });

    it('should reject transitions from terminal state CANCELLED', async () => {
      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
        id: 'order-123',
        status: 'CANCELLED',
        items: [],
      } as any);

      await expect(
        service.updateStatus(
          'order-123',
          { status: 'CONFIRMED' },
          { userId: 'admin-1', email: 'admin@distributor.com', role: 'ADMIN', name: 'Admin' },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Multi-tenant Cross-Company Access Control', () => {
    it('should forbid buyer from accessing another company order (403)', async () => {
      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
        id: 'order-999',
        companyId: 'company-b',
        userId: 'buyer-b',
        status: 'PENDING',
      } as any);

      await expect(
        service.findOne('order-999', {
          userId: 'buyer-a',
          email: 'buyer@companya.com',
          role: 'BUYER',
          companyId: 'company-a', // different company!
          name: 'Buyer A',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
