import { notFound,redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/sidebar";
import { AreaStageWorkspace } from "@/components/area-stage-workspace";
import { findSector,findStage } from "@/lib/erp-navigation";
export const dynamic="force-dynamic";
export default async function AreaStagePage({params}:{params:Promise<{sector:string;stage:string}>}){
 const session=await getSession();if(!session)redirect("/login");
 const{sector:sectorSlug,stage:stageSlug}=await params;
 const sector=findSector(sectorSlug);const stage=findStage(sectorSlug,stageSlug);if(!sector||!stage)notFound();
 const tenant=await db.tenant.findUnique({where:{id:session.tenantId}});
 return <div className="app-shell"><Sidebar tenant={tenant?.name??"Empresa"} user={session.name}/><div className="content"><AreaStageWorkspace sector={sector} stage={stage}/></div></div>
}
