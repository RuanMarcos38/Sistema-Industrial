import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { apiError, fail, ok } from "@/lib/api";
import { isModuleSlug } from "@/lib/modules";

const text = z.string().trim().min(1).max(160);

export async function GET(
  _: Request,
  { params }: { params: Promise<{ module: string }> },
) {
  try {
    const { tenantId } = await requireSession();
    const { module } = await params;
    if (!isModuleSlug(module)) return fail("Módulo inválido", 404);

    switch (module) {
      case "crm":
        return ok(
          await db.customer.findMany({
            where: { tenantId },
            orderBy: { createdAt: "desc" },
            take: 100,
          }),
        );
      case "compras":
        return ok(
          await db.supplier.findMany({
            where: { tenantId },
            orderBy: { createdAt: "desc" },
            take: 100,
          }),
        );
      case "estoque":
        return ok(
          await db.product.findMany({
            where: { tenantId },
            orderBy: { createdAt: "desc" },
            take: 100,
          }),
        );
      case "producao":
        return ok(
          await db.productionOrder.findMany({
            where: { tenantId },
            orderBy: { createdAt: "desc" },
            take: 100,
          }),
        );
      case "financeiro":
        return ok(
          await db.receivable.findMany({
            where: { tenantId },
            orderBy: { dueAt: "asc" },
            take: 100,
          }),
        );
      case "rh":
        return ok(
          await db.employee.findMany({
            where: { tenantId },
            orderBy: { name: "asc" },
            take: 100,
          }),
        );
      case "logistica":
        return ok(
          await db.shipment.findMany({
            where: { tenantId },
            orderBy: { createdAt: "desc" },
            take: 100,
          }),
        );
    }
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ module: string }> },
) {
  try {
    const session = await requireSession();
    const { module } = await params;
    if (!isModuleSlug(module)) return fail("Módulo inválido", 404);

    const body = await request.json();
    let record: { id: string } | null = null;

    switch (module) {
      case "crm": {
        const p = z
          .object({
            name: text,
            document: text,
            email: z.string().trim().optional().default(""),
          })
          .parse(body);
        record = await db.customer.create({
          data: { tenantId: session.tenantId, ...p },
        });
        break;
      }
      case "compras": {
        const p = z
          .object({
            name: text,
            document: text,
            leadTimeDays: z.coerce.number().int().min(0).max(365).default(7),
          })
          .parse(body);
        record = await db.supplier.create({
          data: { tenantId: session.tenantId, ...p },
        });
        break;
      }
      case "estoque": {
        const p = z
          .object({
            sku: text,
            name: text,
            category: text,
            priceCents: z.coerce.number().int().min(0),
          })
          .parse(body);
        record = await db.product.create({
          data: { tenantId: session.tenantId, ...p },
        });
        break;
      }
      case "producao": {
        const p = z
          .object({
            number: text,
            productName: text,
            plannedQty: z.coerce.number().int().positive(),
          })
          .parse(body);
        record = await db.productionOrder.create({
          data: { tenantId: session.tenantId, ...p },
        });
        break;
      }
      case "financeiro": {
        const p = z
          .object({
            description: text,
            amountCents: z.coerce.number().int().positive(),
            dueAt: z.string().min(10),
          })
          .parse(body);
        record = await db.receivable.create({
          data: {
            tenantId: session.tenantId,
            description: p.description,
            amountCents: p.amountCents,
            dueAt: new Date(p.dueAt),
          },
        });
        break;
      }
      case "rh": {
        const p = z
          .object({
            registration: text,
            name: text,
            department: text,
            position: text,
          })
          .parse(body);
        const org = await db.organization.findFirst({
          where: { tenantId: session.tenantId },
        });
        if (!org) return fail("Cadastre uma empresa antes", 409);
        record = await db.employee.create({
          data: {
            tenantId: session.tenantId,
            organizationId: org.id,
            ...p,
            hiredAt: new Date(),
          },
        });
        break;
      }
      case "logistica": {
        const p = z
          .object({ code: text, carrier: text, destination: text })
          .parse(body);
        record = await db.shipment.create({
          data: { tenantId: session.tenantId, ...p },
        });
        break;
      }
    }

    if (!record) return fail("Operação não implementada", 400);

    await db.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorId: session.userId,
        action: "create",
        entity: module,
        entityId: record.id,
        payload: body,
      },
    });

    return ok(record, 201);
  } catch (error) {
    if (error instanceof z.ZodError) return fail("Revise os campos informados", 422);
    return apiError(error);
  }
}
