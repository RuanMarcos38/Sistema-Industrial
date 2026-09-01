"use client";
import { useMemo,useState } from "react";
import { ArrowRight,CheckCircle2,Search } from "lucide-react";
import type { ErpSector,ErpStage } from "@/lib/erp-navigation";

export function AreaStageWorkspace({sector,stage}:{sector:ErpSector;stage:ErpStage}){
 const[query,setQuery]=useState("");
 const currentIndex=sector.stages.findIndex(s=>s.slug===stage.slug);
 const previous=currentIndex>0?sector.stages[currentIndex-1]:null;
 const next=currentIndex>=0&&currentIndex<sector.stages.length-1?sector.stages[currentIndex+1]:null;
 const searchLabel=useMemo(()=>`Pesquisar somente em ${stage.label}`,[stage.label]);
 return <div className="stage-page">
  <header className="stage-head">
   <div><span className="eyebrow-dark">{sector.label.toUpperCase()} · ETAPA {currentIndex+1} DE {sector.stages.length}</span><h1>{stage.label}</h1><p>{stage.description}</p></div>
   <div className="stage-state"><CheckCircle2/><span><small>ESCOPO DA TELA</small>Somente esta etapa</span></div>
  </header>

  <section className="stage-context">
   <div className="stage-context-main"><strong>Área independente</strong><p>Esta tela possui contexto próprio de operação, filtros e permissões. Informações de outras etapas não são misturadas aqui.</p></div>
   <div className="stage-step-number">{String(currentIndex+1).padStart(2,"0")}</div>
  </section>

  <section className="table-panel stage-records">
   <div className="table-toolbar"><div className="table-search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={searchLabel}/></div><span>0 registros nesta etapa</span></div>
   <div className="stage-empty"><strong>Nenhum registro carregado nesta etapa</strong><p>O workspace está isolado por setor, etapa e empresa ativa. Registros reais aparecerão aqui quando o backend específico desta etapa estiver conectado.</p></div>
  </section>

  <section className="stage-flow">
   <div><span className="eyebrow-dark">FLUXO DO SETOR</span><h2>{sector.label}</h2><p>Use as etapas abaixo somente para navegação. A operação continua separada em telas independentes.</p></div>
   <div className="stage-flow-list">{sector.stages.map((item,index)=><a key={item.slug} className={item.slug===stage.slug?"current":""} href={`/area/${sector.slug}/${item.slug}`}><span>{String(index+1).padStart(2,"0")}</span><strong>{item.label}</strong>{item.slug===stage.slug?<small>Etapa atual</small>:<ArrowRight/>}</a>)}</div>
  </section>

  <footer className="stage-footer-nav">
   {previous?<a href={`/area/${sector.slug}/${previous.slug}`} className="secondary">← {previous.label}</a>:<span/>}
   {next?<a href={`/area/${sector.slug}/${next.slug}`} className="primary">Próxima: {next.label} →</a>:<a href="/dashboard" className="primary">Concluir setor →</a>}
  </footer>
 </div>
}
