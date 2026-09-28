import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.stockLog.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  await prisma.product.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // 1. Create Companies
  const apexCompany = await prisma.company.create({
    data: {
      name: 'Apex Industrial Supplies Ltd',
      creditTerms: 'Net 30',
    },
  });

  const nexaCompany = await prisma.company.create({
    data: {
      name: 'Nexa Global Logistics Corp',
      creditTerms: 'Net 60',
    },
  });

  const vanguardCompany = await prisma.company.create({
    data: {
      name: 'Vanguard Hardware Co',
      creditTerms: 'Advance Payment',
    },
  });

  console.log('🏢 Companies seeded.');

  // 2. Create Users with bcrypt password hashes
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin123!', salt);
  const salesPassword = await bcrypt.hash('Sales123!', salt);
  const buyerPassword = await bcrypt.hash('Buyer123!', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@distributor.com',
      passwordHash: adminPassword,
      name: 'Eleanor Vance (Operations Director)',
      role: 'ADMIN',
    },
  });

  const salesRep = await prisma.user.create({
    data: {
      email: 'sales@distributor.com',
      passwordHash: salesPassword,
      name: 'Marcus Brody (Senior Sales Rep)',
      role: 'SALES_REP',
    },
  });

  const buyerApex = await prisma.user.create({
    data: {
      email: 'buyer@apexcorp.com',
      passwordHash: buyerPassword,
      name: 'Sarah Connor (Apex Procurement)',
      role: 'BUYER',
      companyId: apexCompany.id,
    },
  });

  const buyerNexa = await prisma.user.create({
    data: {
      email: 'buyer@nexa.com',
      passwordHash: buyerPassword,
      name: 'David Chen (Nexa Purchasing)',
      role: 'BUYER',
      companyId: nexaCompany.id,
    },
  });

  console.log('👥 Users created for ADMIN, SALES_REP, and BUYER roles.');

  // Initialize empty open carts for buyers
  await prisma.cart.create({
    data: {
      userId: buyerApex.id,
      status: 'OPEN',
    },
  });

  await prisma.cart.create({
    data: {
      userId: buyerNexa.id,
      status: 'OPEN',
    },
  });

  // 3. Create Products Catalog
  const productsData = [
    {
      sku: 'IND-SENS-01',
      name: 'Industrial Optical Sensor 24V',
      category: 'Automation',
      description: 'Rugged retro-reflective photoelectric sensor with 5m detection range and IP67 rating.',
      price: 145.0,
      stockQty: 85,
    },
    {
      sku: 'IND-VALV-02',
      name: 'Pneumatic Control Solenoid Valve',
      category: 'Pneumatics',
      description: '5/2 way single solenoid pilot valve with manual override and 24VDC coil.',
      price: 89.5,
      stockQty: 120,
    },
    {
      sku: 'IND-PUMP-03',
      name: 'Hydraulic Rotary Vane Pump 10HP',
      category: 'Hydraulics',
      description: 'High pressure fixed displacement hydraulic vane pump delivering 3000 PSI.',
      price: 620.0,
      stockQty: 14,
    },
    {
      sku: 'IND-REL-04',
      name: 'Solid State Relay 3-Phase 40A',
      category: 'Electrical',
      description: 'Zero-crossing AC solid state relay with integrated heat sink and LED indicator.',
      price: 42.0,
      stockQty: 250,
    },
    {
      sku: 'IND-BEAR-05',
      name: 'Heavy-Duty Pillow Block Bearing 50mm',
      category: 'Mechanical',
      description: 'Cast iron housing self-aligning ball bearing unit with grease fitting.',
      price: 68.0,
      stockQty: 90,
    },
    {
      sku: 'IND-PLC-06',
      name: 'Programmable Logic Controller CPU Module',
      category: 'Automation',
      description: 'High-speed compact PLC with Ethernet/IP, 16 DI / 16 DO transistor outputs.',
      price: 850.0,
      stockQty: 8,
    },
    {
      sku: 'IND-CABL-07',
      name: 'Shielded Multi-Conductor Cable (100m)',
      category: 'Electrical',
      description: 'Heavy duty foil-shielded 4-conductor 18AWG instrumentation cable spool.',
      price: 195.0,
      stockQty: 40,
    },
    {
      sku: 'IND-FILT-08',
      name: 'High-Pressure Hydraulic In-line Filter',
      category: 'Hydraulics',
      description: 'Continuous flow microglass filter rated for 400 bar working pressure.',
      price: 115.0,
      stockQty: 65,
    },
    {
      sku: 'IND-DRIV-09',
      name: 'Variable Frequency Drive 15kW 480V',
      category: 'Electrical',
      description: 'Vector control AC inverter drive with Modbus RTU interface.',
      price: 1120.0,
      stockQty: 5,
    },
    {
      sku: 'IND-GAUG-10',
      name: 'Digital Pressure Gauge 0-1000 PSI',
      category: 'Instrumentation',
      description: '0.25% full scale accuracy stainless steel gauge with backlit LCD.',
      price: 175.0,
      stockQty: 55,
    },
    {
      sku: 'IND-ACT-11',
      name: 'Linear Actuator 12V 500mm Stroke',
      category: 'Mechanical',
      description: '1500N dynamic load capacity electric actuator with built-in limit switches.',
      price: 135.0,
      stockQty: 30,
    },
    {
      sku: 'IND-TEMP-12',
      name: 'Thermocouple Temperature Transmitter PT100',
      category: 'Instrumentation',
      description: 'Head mounted programmable 4-20mA RTD temperature transmitter.',
      price: 92.0,
      stockQty: 110,
    },
  ];

  const createdProducts = [];
  for (const prod of productsData) {
    const p = await prisma.product.create({
      data: prod,
    });
    createdProducts.push(p);

    // Initial stock log
    await prisma.stockLog.create({
      data: {
        productId: p.id,
        delta: p.stockQty,
        reason: 'RESTOCK',
      },
    });
  }

  console.log(`📦 Seeded ${createdProducts.length} distributor products with initial stock logs.`);

  // 4. Create an initial sample order with snapshot prices and an invoice for Apex
  const sampleOrder = await prisma.order.create({
    data: {
      companyId: apexCompany.id,
      userId: buyerApex.id,
      status: 'CONFIRMED',
      poNumber: 'PO-APEX-2026-001',
      paymentTerms: 'Net 30',
      totalAmount: 145.0 * 2 + 89.5 * 4, // 290 + 358 = 648
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            qty: 2,
            unitPriceSnapshot: createdProducts[0].price,
          },
          {
            productId: createdProducts[1].id,
            qty: 4,
            unitPriceSnapshot: createdProducts[1].price,
          },
        ],
      },
    },
  });

  // Generate corresponding Invoice
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const subtotal = 648.0;
  const tax = Number((subtotal * 0.18).toFixed(2));
  const grandTotal = Number((subtotal + tax).toFixed(2));

  await prisma.invoice.create({
    data: {
      orderId: sampleOrder.id,
      invoiceNumber: 'INV-2026-0001',
      dueDate,
      subtotal,
      taxAmount: tax,
      totalAmount: grandTotal,
      status: 'UNPAID',
    },
  });

  // Initial audit log
  await prisma.auditLog.create({
    data: {
      actorId: buyerApex.id,
      action: 'ORDER_CREATED',
      entity: 'Order',
      entityId: sampleOrder.id,
      details: JSON.stringify({
        poNumber: 'PO-APEX-2026-001',
        totalAmount: grandTotal,
        itemsCount: 2,
      }),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: salesRep.id,
      action: 'ORDER_STATUS_CHANGED',
      entity: 'Order',
      entityId: sampleOrder.id,
      details: JSON.stringify({
        from: 'PENDING',
        to: 'CONFIRMED',
      }),
    },
  });

  console.log('✅ Database seed complete with sample order, invoice, and audit logs!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
