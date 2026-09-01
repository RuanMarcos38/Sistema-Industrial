import { SignJWT,jwtVerify } from "jose";
import { cookies } from "next/headers";
export type Session={userId:string;tenantId:string;role:string;name:string};
const raw=process.env.AUTH_SECRET??"development-only-secret-change-me-32-chars";const secret=new TextEncoder().encode(raw);
export async function createToken(session:Session){return new SignJWT(session).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("8h").sign(secret)}
export async function getSession():Promise<Session|null>{const token=(await cookies()).get("industrial_session")?.value;if(!token)return null;try{const {payload}=await jwtVerify(token,secret);return payload as unknown as Session}catch{return null}}
export async function requireSession(){const session=await getSession();if(!session)throw new Error("UNAUTHORIZED");return session}
