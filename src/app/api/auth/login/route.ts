import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { createToken } from "@/lib/auth";
import { apiError,fail,ok } from "@/lib/api";
const schema=z.object({email:z.email(),password:z.string().min(8)});
export async function POST(request:Request){try{const parsed=schema.safeParse(await request.json());if(!parsed.success)return fail("Informe email e senha válidos");const user=await db.user.findUnique({where:{email:parsed.data.email.toLowerCase()},include:{memberships:{include:{tenant:true}}}});if(!user||!(await bcrypt.compare(parsed.data.password,user.passwordHash))||!user.memberships[0])return fail("Email ou senha inválidos",401);const membership=user.memberships[0];const token=await createToken({userId:user.id,tenantId:membership.tenantId,role:membership.role,name:user.name});(await cookies()).set("industrial_session",token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:28800});return ok({user:{name:user.name,role:membership.role},tenant:{name:membership.tenant.name}})}catch(error){return apiError(error)}}
