"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState} from "react";
import {Icon} from "@/components/ui";
const groups=[
 {title:"Operação",items:[{href:"/painel",icon:"chart",label:"Visão geral"},{href:"/painel/agenda",icon:"calendar",label:"Agenda"},{href:"/painel/arenas",icon:"field",label:"Arenas e espaços"}]},
 {title:"Ensino",items:[{href:"/painel/servicos",icon:"field",label:"Serviços"},{href:"/painel/turmas",icon:"calendar",label:"Turmas"},{href:"/painel/alunos",icon:"users",label:"Alunos"},{href:"/painel/mensalidades",icon:"wallet",label:"Mensalidades"}]}
];
export function AdminNav(){const path=usePathname();const [expanded,setExpanded]=useState(false);const active=(href:string)=>href==="/painel"?path===href:path===href||path.startsWith(href+"/");
return <div className="owner-navigation"><button type="button" className="owner-menu-toggle" aria-expanded={expanded} aria-controls="owner-menu" onClick={()=>setExpanded(v=>!v)}><span>{groups.flatMap(g=>g.items).find(x=>active(x.href))?.label??"Menu"}</span><span aria-hidden="true">{expanded?"−":"+"}</span></button><nav id="owner-menu" className={expanded?"owner-menu is-open":"owner-menu"} aria-label="Menu administrativo">{groups.map(g=><section key={g.title} className="owner-nav-group"><h2>{g.title}</h2>{g.items.map(x=><Link key={x.href} href={x.href} onClick={()=>setExpanded(false)} aria-current={active(x.href)?"page":undefined} className={active(x.href)?"admin-active":""}><Icon name={x.icon}/><span>{x.label}</span></Link>)}</section>)}<section className="owner-nav-group owner-nav-upcoming"><h2>Em preparação</h2><span><Icon name="link"/>Convênios</span><span><Icon name="wallet"/>Meu plano</span></section></nav></div>}
