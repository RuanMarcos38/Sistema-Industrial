import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { apiError, fail, ok } from "@/lib/api";
import { generateZpl } from "@/lib/zpl";

const schema = z.object({
  type: z.enum(["product", "shipping", "pallet", "location", "volume"]),
  code: z.string().trim().min(1).max(120),
  description: z.string().trim().max(120).optional().default(""),
  secondary: z.string().trim().max(120).optional().default(""),
  quantity: z.coerce.number().int().min(1).max(10000).default(1),
});

export async function POST(request: Request) {
  try {
    await requireSession();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return fail("Revise os dados da etiqueta", 422);
    return ok(generateZpl(parsed.data));
  } catch (error) {
    return apiError(error);
  }
}
