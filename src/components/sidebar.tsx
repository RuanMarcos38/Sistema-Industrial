"use client";
import { useMemo,useState } from "react";
import { usePathname,useRouter } from "next/navigation";
import { Building2,ChevronDown,ChevronRight,LayoutDashboard,LogOut,PackageSearch } from "lucide-react";
import { ERP_SECTORS } from "@/lib/erp-navigation";

export function Sidebar({tenant,user}:{tenant:string;user:string}){
 const pathname=usePathname();
 const router=useRouter();
 const currentSector=useMemo(()=>ERP_SECTORS.find(s=>pathname.startsWith(`/area/${s.slug}/`))?.slug,[pathname]);
 const [open,setOpen]=useState<string[]>(currentSector?[currentSector]:[]);
 function toggle(slug:string){setOpen(v=>v.includes(slug)?v.filter(x=>x!==slug):[...v,slug])}
 async function logout(){await fetch("/api/auth/logout",{method:"POST"});router.push("/login");router.refresh()}
 return <aside className="sidebar">
  <div className="brand"><div className="brand-symbol"><PackageSearch/></div><span><strong>Sistema</strong><small>Industrial OS</small></span></div>
  <div className="workspace"><Building2/><span><small>EMPRESA ATIVA</small>{tenant}</span><ChevronDown/></div>
  <nav className="erp-nav">
   <a className={pathname==="/dashboard"?"active":""} href="/dashboard"><LayoutDashboard/>Visão Executiva</a>
   {ERP_SECTORS.map(sector=>{const Icon=sector.icon;const expanded=open.includes(sector.slug)||currentSector===sector.slug;return <div className="sector-block" key={sector.slug}>
    <button type="button" className={`sector-toggle ${currentSector===sector.slug?"sector-active":""}`} onClick={()=>toggle(sector.slug)} aria-expanded={expanded}>
     <Icon/><span>{sector.label}</span>{expanded?<ChevronDown className="sector-chevron"/>:<ChevronRight className="sector-chevron"/>}
    </button>
    {expanded&&<div className="sector-children">{sector.stages.map(stage=><a key={stage.slug} className={pathname===`/area/${sector.slug}/${stage.slug}`?"active child-active":""} href={`/area/${sector.slug}/${stage.slug}`}><span className="child-dot"/>{stage.label}</a>)}</div>}
   </div>})}
  </nav>
  <div className="sidebar-foot"><div className="avatar">{user.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()}</div><span><strong>{user}</strong><small>Administrador</small></span><button onClick={logout} aria-label="Sair"><LogOut/></button></div>
 </aside>
}
