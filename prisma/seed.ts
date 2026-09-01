import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  if (process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error("Demo seed bloqueado. Defina ALLOW_DEMO_SEED=true somente em desenvolvimento/teste.");
  }

  await db.auditLog.deleteMany();
  await db.shipment.deleteMany();
  await db.receivable.deleteMany();
  await db.payable.deleteMany();
  await db.productionOrder.deleteMany();
  await db.purchaseOrder.deleteMany();
  await db.salesOrder.deleteMany();
  await db.inventoryBalance.deleteMany();
  await db.warehouse.deleteMany();
  await db.product.deleteMany();
  await db.supplier.deleteMany();
  await db.customer.deleteMany();
  await db.employee.deleteMany();
  await db.organization.deleteMany();
  await db.membership.deleteMany();
  await db.tenant.deleteMany();

  const tenant = await db.tenant.create({
    data: {
      name: "Empresa Demonstração",
      slug: "empresa-demo",
      plan: "enterprise",
      status: "active",
    },
  });

  const org = await db.organization.create({
    data: {
      tenantId: tenant.id,
      legalName: "Empresa Demonstração Ltda",
      tradeName: "Empresa Demo",
      cnpj: "00.000.000/0001-00",
      city: "Joinville",
      state: "SC",
    },
  });

  const wh = await db.warehouse.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      code: "CD-01",
      name: "Centro de Distribuição",
    },
  });

  await db.customer.createMany({
    data: [
      {
        tenantId: tenant.id,
        name: "Cliente B2B Desenvolvimento",
        document: "00.000.000/0002-00",
        email: "compras@exemplo.local",
      },
      {
        tenantId: tenant.id,
        name: "Cliente Varejo Desenvolvimento",
        document: "000.000.000-00",
      },
    ],
  });

  await db.supplier.create({
    data: {
      tenantId: tenant.id,
      name: "Fornecedor Desenvolvimento",
      document: "00.000.000/0003-00",
      leadTimeDays: 5,
    },
  });

  const product = await db.product.create({
    data: {
      tenantId: tenant.id,
      sku: "SKU-DEMO-001",
      name: "Produto de Desenvolvimento",
      category: "Demonstração",
      priceCents: 15990,
      costCents: 8200,
    },
  });

  await db.inventoryBalance.create({
    data: {
      tenantId: tenant.id,
      warehouseId: wh.id,
      productId: product.id,
      quantity: 120,
      reserved: 18,
      reorderPoint: 40,
    },
  });

  await db.salesOrder.create({
    data: {
      tenantId: tenant.id,
      number: "PV-DEV-001",
      customerName: "Cliente B2B Desenvolvimento",
      totalCents: 185000,
      status: "open",
    },
  });

  await db.purchaseOrder.create({
    data: {
      tenantId: tenant.id,
      number: "PC-DEV-001",
      supplierName: "Fornecedor Desenvolvimento",
      totalCents: 74200,
      status: "open",
    },
  });

  await db.productionOrder.create({
    data: {
      tenantId: tenant.id,
      number: "OP-DEV-001",
      productName: "Produto de Desenvolvimento",
      plannedQty: 250,
      producedQty: 96,
      status: "in_progress",
    },
  });

  await db.receivable.create({
    data: {
      tenantId: tenant.id,
      description: "Duplicata desenvolvimento",
      amountCents: 185000,
      dueAt: new Date("2026-09-10"),
    },
  });

  await db.payable.create({
    data: {
      tenantId: tenant.id,
      description: "Compra desenvolvimento",
      amountCents: 74200,
      dueAt: new Date("2026-09-08"),
    },
  });

  await db.employee.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      registration: "DEV-001",
      name: "Colaborador Desenvolvimento",
      department: "Operações",
      position: "Analista",
      hiredAt: new Date("2026-01-10"),
    },
  });

  await db.shipment.create({
    data: {
      tenantId: tenant.id,
      code: "EXP-DEV-001",
      carrier: "Transportadora Desenvolvimento",
      destination: "Joinville/SC",
      status: "in_transit",
      freightCents: 8900,
    },
  });
}

main().finally(() => db.$disconnect());
