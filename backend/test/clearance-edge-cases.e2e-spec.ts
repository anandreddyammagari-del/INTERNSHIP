import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';

describe('Testing Clearance Plan — Section 6.2 Edge Cases (E2E Suite)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let buyerApexToken: string;
  let buyerNexaToken: string;
  let adminToken: string;
  let salesToken: string;
  let expiredToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Obtain tokens by authenticating seeded users
    const loginApex = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'buyer@apexcorp.com', password: 'Buyer123!' });
    buyerApexToken = loginApex.body.accessToken;

    const loginNexa = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'buyer@nexa.com', password: 'Buyer123!' });
    buyerNexaToken = loginNexa.body.accessToken;

    const loginAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@distributor.com', password: 'Admin123!' });
    adminToken = loginAdmin.body.accessToken;

    const loginSales = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'sales@distributor.com', password: 'Sales123!' });
    salesToken = loginSales.body.accessToken;

    // Craft expired token
    const decoded: any = jwtService.decode(buyerApexToken);
    expiredToken = jwtService.sign(
      { sub: decoded.sub, email: decoded.email, role: decoded.role, companyId: decoded.companyId },
      {
        secret: process.env.JWT_SECRET || 'b2b-super-secret-jwt-key-2026-arrowstack',
        expiresIn: -10, // already expired
      },
    );
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // --------------------------------------------------------------------------
  // Edge Case 1: Qty > available stock -> rejected, no partial order created
  // --------------------------------------------------------------------------
  it('Edge Case 1: Checkout rejected when quantity > available stock, no order created', async () => {
    // Clear buyer's cart first
    await request(app.getHttpServer())
      .delete('/cart/clear')
      .set('Authorization', `Bearer ${buyerApexToken}`);

    // Find product with limited stock
    const product = await prisma.product.findFirst({
      where: { isActive: true, stockQty: { gt: 0 } },
    });

    // Attempt to add more than available stock to cart
    const addRes = await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${buyerApexToken}`)
      .send({ productId: product.id, qty: product.stockQty + 50 });

    expect(addRes.status).toBe(400);
    expect(addRes.body.message).toContain('exceeds available stock');

    // Attempt checkout on empty cart
    const checkoutRes = await request(app.getHttpServer())
      .post('/orders/checkout')
      .set('Authorization', `Bearer ${buyerApexToken}`)
      .send({});

    expect(checkoutRes.status).toBe(400);
    expect(checkoutRes.body.message).toContain('Cannot checkout with an empty cart');
  });

  // --------------------------------------------------------------------------
  // Edge Case 2: Concurrent checkout on last unit of stock -> exactly 1 succeeds
  // --------------------------------------------------------------------------
  it('Edge Case 2: Race condition - Two buyers checkout the last unit simultaneously (only 1 succeeds)', async () => {
    // 1. Create a scarce product with exactly 1 unit in stock
    const scarceProduct = await prisma.product.create({
      data: {
        sku: `RACE-TEST-${Date.now()}`,
        name: 'Scarce Microchip (Last Unit)',
        category: 'Automation',
        price: 99.0,
        stockQty: 1,
      },
    });

    // 2. Clear both carts
    await request(app.getHttpServer())
      .delete('/cart/clear')
      .set('Authorization', `Bearer ${buyerApexToken}`);
    await request(app.getHttpServer())
      .delete('/cart/clear')
      .set('Authorization', `Bearer ${buyerNexaToken}`);

    // 3. Both add 1 unit to cart
    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${buyerApexToken}`)
      .send({ productId: scarceProduct.id, qty: 1 });

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${buyerNexaToken}`)
      .send({ productId: scarceProduct.id, qty: 1 });

    // 4. Trigger simultaneous concurrent checkouts
    const [resApex, resNexa] = await Promise.all([
      request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerApexToken}`)
        .send({ poNumber: 'PO-RACE-APEX' }),
      request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerNexaToken}`)
        .send({ poNumber: 'PO-RACE-NEXA' }),
    ]);

    // Assert race condition handling:
    const statuses = [resApex.status, resNexa.status];
    expect(statuses).toContain(201); // exactly one successful checkout
    expect(statuses).toContain(400); // exactly one rejected due to depleted stock

    // Confirm final stock in DB is exactly 0 (no negative stock!)
    const updatedScarce = await prisma.product.findUnique({ where: { id: scarceProduct.id } });
    expect(updatedScarce.stockQty).toBe(0);
  });

  // --------------------------------------------------------------------------
  // Edge Case 3: Expired JWT on a mutating request -> 401, no side effects
  // --------------------------------------------------------------------------
  it('Edge Case 3: Expired JWT on a mutating request returns 401 Unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders/checkout')
      .set('Authorization', `Bearer ${expiredToken}`)
      .send({ poNumber: 'PO-EXPIRED' });

    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  // --------------------------------------------------------------------------
  // Edge Case 4: Buyer attempts to access another company\'s order -> 403
  // --------------------------------------------------------------------------
  it('Edge Case 4: Buyer attempts to access another company order returns 403 Forbidden', async () => {
    // 1. Apex places an order
    await request(app.getHttpServer())
      .delete('/cart/clear')
      .set('Authorization', `Bearer ${buyerApexToken}`);

    const product = await prisma.product.findFirst({
      where: { isActive: true, stockQty: { gte: 5 } },
    });

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${buyerApexToken}`)
      .send({ productId: product.id, qty: 1 });

    const orderRes = await request(app.getHttpServer())
      .post('/orders/checkout')
      .set('Authorization', `Bearer ${buyerApexToken}`)
      .send({ poNumber: 'PO-APEX-ISOLATION-TEST' });

    expect(orderRes.status).toBe(201);
    const apexOrderId = orderRes.body.orderId;

    // 2. Nexa Buyer attempts to access Apex\'s order
    const crossAccessRes = await request(app.getHttpServer())
      .get(`/orders/${apexOrderId}`)
      .set('Authorization', `Bearer ${buyerNexaToken}`);

    expect(crossAccessRes.status).toBe(403);
    expect(crossAccessRes.body.statusCode).toBe(403);
    expect(crossAccessRes.body.message).toContain('Access denied');
  });

  // --------------------------------------------------------------------------
  // Edge Case 5: Admin edits price mid-checkout -> order uses price snapshot
  // --------------------------------------------------------------------------
  it('Edge Case 5: Order preserves unitPriceSnapshot even when Admin changes price later', async () => {
    // 1. Create a product priced at $100
    const snapshotProduct = await prisma.product.create({
      data: {
        sku: `SNAP-TEST-${Date.now()}`,
        name: 'Price Snapshot Instrument',
        price: 100.0,
        stockQty: 20,
      },
    });

    // 2. Buyer adds to cart and checks out
    await request(app.getHttpServer())
      .delete('/cart/clear')
      .set('Authorization', `Bearer ${buyerApexToken}`);

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${buyerApexToken}`)
      .send({ productId: snapshotProduct.id, qty: 2 });

    const checkoutRes = await request(app.getHttpServer())
      .post('/orders/checkout')
      .set('Authorization', `Bearer ${buyerApexToken}`)
      .send({ poNumber: 'PO-PRICE-SNAP' });

    expect(checkoutRes.status).toBe(201);
    const orderId = checkoutRes.body.orderId;

    // 3. Admin raises the price from $100 to $250
    const priceUpdateRes = await request(app.getHttpServer())
      .patch(`/admin/products/${snapshotProduct.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 250.0 });

    expect(priceUpdateRes.status).toBe(200);

    // 4. Retrieve original order and assert unitPriceSnapshot is still $100
    const orderDetailRes = await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${buyerApexToken}`);

    expect(orderDetailRes.status).toBe(200);
    const item = orderDetailRes.body.items.find((i: any) => i.productId === snapshotProduct.id);
    expect(item.unitPriceSnapshot).toBe(100.0);
    expect(item.qty).toBe(2);
    expect(orderDetailRes.body.totalAmount).toBe(200.0);
  });

  // --------------------------------------------------------------------------
  // Edge Case 6: Out-of-sequence order status transition -> rejected
  // --------------------------------------------------------------------------
  it('Edge Case 6: Reject out-of-sequence order status transition (PENDING -> FULFILLED skipping CONFIRMED)', async () => {
    // Create an explicit fresh order in PENDING status
    const company = await prisma.company.findFirst();
    const user = await prisma.user.findFirst({ where: { role: 'BUYER' } });
    const order = await prisma.order.create({
      data: {
        companyId: company.id,
        userId: user.id,
        status: 'PENDING',
        totalAmount: 150.0,
        poNumber: `PO-EDGE6-${Date.now()}`,
      },
    });

    // Attempt illegal transition: PENDING -> FULFILLED directly
    const res = await request(app.getHttpServer())
      .patch(`/orders/${order.id}/status`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ status: 'FULFILLED' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid status transition');
  });

  // --------------------------------------------------------------------------
  // Edge Case 7: Malformed / unknown DTO fields -> 400 validation error shape
  // --------------------------------------------------------------------------
  it('Edge Case 7: Malformed or unexpected DTO fields rejected with 400, returning standardized error shape', async () => {
    const res = await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${buyerApexToken}`)
      .send({
        productId: 'valid-product-id',
        qty: -5, // Invalid negative qty
        unexpectedInjectedField: 'exploit-attempt', // Forbidden unknown property
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('statusCode', 400);
    expect(res.body).toHaveProperty('code');
    expect(res.body).toHaveProperty('message');
    // Ensure it's not a generic 500 crash
    expect(res.body.statusCode).not.toBe(500);
  });

  // --------------------------------------------------------------------------
  // Edge Case 8: Duplicate invoice number generation -> blocked by unique constraint
  // --------------------------------------------------------------------------
  it('Edge Case 8: Duplicate invoice number blocked by unique database constraint', async () => {
    const existingInvoice = await prisma.invoice.findFirst();
    expect(existingInvoice).toBeDefined();

    // Attempt to manually create an invoice with the exact same invoiceNumber
    let errorCaught: any = null;
    try {
      await prisma.invoice.create({
        data: {
          orderId: 'dummy-order-unique-id',
          invoiceNumber: existingInvoice.invoiceNumber, // duplicate!
          dueDate: new Date(),
          subtotal: 100,
          taxAmount: 18,
          totalAmount: 118,
          status: 'UNPAID',
        },
      });
    } catch (err: any) {
      errorCaught = err;
    }

    expect(errorCaught).toBeDefined();
    // Prisma unique constraint violation code is P2002
    expect(errorCaught.code).toBe('P2002');
  });
});
