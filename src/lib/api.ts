import { NextResponse } from "next/server";
export const ok=<T>(data:T,status=200)=>NextResponse.json({data},{status});
export const fail=(message:string,status=400)=>NextResponse.json({error:message},{status});
export function apiError(error:unknown){if(error instanceof Error&&error.message==="UNAUTHORIZED")return fail("Sessão expirada",401);console.error(error);return fail("Não foi possível concluir a operação",500)}
