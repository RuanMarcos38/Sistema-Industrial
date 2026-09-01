import { redirect,notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/sidebar";
import { ModuleClient } from "@/components/module-client";
import { isModuleSlug } from "@/lib/modules";
export const dynamic="force-dynamic";
export default async function ModulePage({params}:{params:Promise<{slug:string}>}){const session=await getSession();if(!session)redirect("/login");const{slug}=await params;if(!isModuleSlug(slug))notFound();const tenant=await db.tenant.findUnique({where:{id:session.tenantId}});return <div className="app-shell"><Sidebar tenant={tenant?.name??"Empresa"} user={session.name}/><div className="content"><ModuleClient slug={slug}/></div></div>}
