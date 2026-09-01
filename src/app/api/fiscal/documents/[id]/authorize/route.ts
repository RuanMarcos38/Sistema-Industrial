import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { apiError, fail, ok } from "@/lib/api";

type DocRow = {
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
  fiscalPayload: unknown;
};

type ProviderResponse = {
  accessKey?: string;
  protocol?: string;
  number?: string | number;
  status?: string;
  rejectionCode?: string;
  rejectionMessage?: string;
  xmlStoragePath?: string;
  pdfStoragePath?: string;
};

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const rows = await db.$queryRaw<DocRow[]>(Prisma.sql`
      select
        id::text as id, model, series, number::text as number,
        recipient_name as "recipientName",
        recipient_document as "recipientDocument",
        operation_nature as "operationNature",
        total_cents::text as "totalCents",
        status, environment, fiscal_payload as "fiscalPayload"
      from public.fiscal_documents
      where id = ${id}::uuid and tenant_id = ${session.tenantId}::uuid
      limit 1
    `);
    const document = rows[0];
    if (!document) return fail("Documento fiscal não encontrado", 404);
    if (!["draft", "rejected"].includes(document.status)) {
      return fail("Documento fiscal não está disponível para autorização", 409);
    }

    const providerUrl = process.env.FISCAL_PROVIDER_URL;
    const providerToken = process.env.FISCAL_PROVIDER_TOKEN;
    if (!providerUrl || !providerToken) {
      return fail("Emissor fiscal não configurado. Defina FISCAL_PROVIDER_URL e FISCAL_PROVIDER_TOKEN no ambiente seguro de produção.", 409);
    }

    await db.$executeRaw(Prisma.sql`
      update public.fiscal_documents
      set status = 'pending_authorization', rejection_code = null, rejection_message = null
      where id = ${id}::uuid and tenant_id = ${session.tenantId}::uuid
    `);

    const response = await fetch(`${providerUrl.replace(/\/$/, "")}/authorize`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${providerToken}`,
      },
      body: JSON.stringify({
        tenantId: session.tenantId,
        document,
      }),
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => ({}))) as ProviderResponse;
    if (!response.ok || payload.status === "rejected") {
      const rejectionCode = payload.rejectionCode ?? String(response.status);
      const rejectionMessage = payload.rejectionMessage ?? "Documento rejeitado pelo emissor fiscal";
      await db.$executeRaw(Prisma.sql`
        update public.fiscal_documents
        set status = 'rejected', rejection_code = ${rejectionCode}, rejection_message = ${rejectionMessage}
        where id = ${id}::uuid and tenant_id = ${session.tenantId}::uuid
      `);
      return fail(`${rejectionCode} - ${rejectionMessage}`, 422);
    }

    if (!payload.accessKey || !payload.protocol) {
      await db.$executeRaw(Prisma.sql`
        update public.fiscal_documents
        set status = 'processing'
        where id = ${id}::uuid and tenant_id = ${session.tenantId}::uuid
      `);
      return ok({ id, status: "processing" }, 202);
    }

    const authorized = await db.$queryRaw<Array<{ id: string; status: string; accessKey: string; protocol: string }>>(Prisma.sql`
      update public.fiscal_documents
      set
        status = 'authorized',
        number = coalesce(${payload.number ? String(payload.number) : null}::bigint, number),
        access_key = ${payload.accessKey},
        protocol = ${payload.protocol},
        xml_storage_path = ${payload.xmlStoragePath ?? null},
        pdf_storage_path = ${payload.pdfStoragePath ?? null},
        authorized_at = now(),
        rejection_code = null,
        rejection_message = null
      where id = ${id}::uuid and tenant_id = ${session.tenantId}::uuid
      returning id::text as id, status, access_key as "accessKey", protocol
    `);

    await db.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorId: session.userId,
        action: "authorize",
        entity: "fiscal_document",
        entityId: id,
        payload: { accessKey: payload.accessKey, protocol: payload.protocol },
      },
    });
    return ok(authorized[0]);
  } catch (error) {
    return apiError(error);
  }
}
