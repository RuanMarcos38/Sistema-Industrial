import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { apiError, fail, ok } from "@/lib/api";

const schema = z.object({
  model: z.enum(["55", "65"]),
  series: z.coerce.number().int().min(1).max(999).default(1),
  recipientName: z.string().trim().min(2).max(160),
  recipientDocument: z.string().trim().max(32).optional().default(""),
  operationNature: z.string().trim().min(2).max(160),
  totalCents: z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
});

type FiscalRow = {
  id: string;
  model: string;
  series: number;
  number: string | null;
  recipientName: string;
  recipientDocument: string | null;
  operationNature: string;
  totalCents: string;
  status: string;
  environment: string;
  accessKey: string | null;
  protocol: string | null;
  rejectionCode: string | null;
  rejectionMessage: string | null;
  createdAt: Date;
};

export async function GET() {
  try {
    const session = await requireSession();
    const rows = await db.$queryRaw<FiscalRow[]>(Prisma.sql`
      select
        id::text as id,
        model,
        series,
        number::text as number,
        recipient_name as "recipientName",
        recipient_document as "recipientDocument",
        operation_nature as "operationNature",
        total_cents::text as "totalCents",
        status,
        environment,
        access_key as "accessKey",
        protocol,
        rejection_code as "rejectionCode",
        rejection_message as "rejectionMessage",
        created_at as "createdAt"
      from public.fiscal_documents
      where tenant_id = ${session.tenantId}::uuid
      order by created_at desc
      limit 100
    `);
    return ok(rows);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return fail("Revise os dados fiscais informados", 422);

    const organization = await db.organization.findFirst({
      where: { tenantId: session.tenantId },
      orderBy: { createdAt: "asc" },
    });
    if (!organization) return fail("Cadastre a empresa emissora antes de criar documentos fiscais", 409);

    const p = parsed.data;
    const rows = await db.$queryRaw<FiscalRow[]>(Prisma.sql`
      insert into public.fiscal_documents (
        tenant_id, organization_id, model, series, recipient_name,
        recipient_document, operation_nature, total_cents, status, environment
      ) values (
        ${session.tenantId}::uuid, ${organization.id}::uuid, ${p.model}, ${p.series},
        ${p.recipientName}, ${p.recipientDocument || null}, ${p.operationNature},
        ${p.totalCents}, 'draft', 'homologation'
      )
      returning
        id::text as id,
        model,
        series,
        number::text as number,
        recipient_name as "recipientName",
        recipient_document as "recipientDocument",
        operation_nature as "operationNature",
        total_cents::text as "totalCents",
        status,
        environment,
        access_key as "accessKey",
        protocol,
        rejection_code as "rejectionCode",
        rejection_message as "rejectionMessage",
        created_at as "createdAt"
    `);

    const record = rows[0];
    await db.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorId: session.userId,
        action: "create_draft",
        entity: "fiscal_document",
        entityId: record.id,
        payload: p,
      },
    });
    return ok(record, 201);
  } catch (error) {
    return apiError(error);
  }
}
