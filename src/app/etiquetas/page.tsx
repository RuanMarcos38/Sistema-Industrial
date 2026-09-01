import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/sidebar";
import { LabelsClient } from "@/components/labels-client";
export const dynamic="force-dynamic";
export default async function LabelsPage(){const session=await getSession();if(!session)redirect("/login");const tenant=await db.tenant.findUnique({where:{id:session.tenantId}});return <div className="app-shell"><Sidebar tenant={tenant?.name??"Empresa"} user={session.name}/><div className="content"><LabelsClient/></div></div>}
