import { cookies } from "next/headers";
import { z } from "zod";
import { createToken } from "@/lib/auth";
import { apiError, fail, ok } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return fail("Informe email e senha válidos");

    const supabase = createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
    });

    if (authError || !authData.user || !authData.session) {
      return fail("Email ou senha inválidos", 401);
    }

    const { data: membership, error: membershipError } = await supabase
      .from("tenant_memberships")
      .select("tenant_id, role")
      .eq("user_id", authData.user.id)
      .limit(1)
      .maybeSingle();

    if (membershipError || !membership) {
      await supabase.auth.signOut();
      return fail("Usuário sem empresa vinculada", 403);
    }

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, name, status")
      .eq("id", membership.tenant_id)
      .single();

    if (tenantError || !tenant || tenant.status !== "active") {
      await supabase.auth.signOut();
      return fail("Empresa indisponível ou sem acesso", 403);
    }

    const displayName =
      (authData.user.user_metadata?.full_name as string | undefined) ??
      authData.user.email ??
      "Usuário";

    const token = await createToken({
      userId: authData.user.id,
      tenantId: membership.tenant_id,
      role: membership.role,
      name: displayName,
    });

    (await cookies()).set("industrial_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 28800,
    });

    return ok({
      user: { name: displayName, role: membership.role },
      tenant: { id: tenant.id, name: tenant.name },
    });
  } catch (error) {
    return apiError(error);
  }
}
