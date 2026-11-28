"use client";
import {usePathname} from "next/navigation";
import {WorkspaceNavigation,type WorkspaceGroup} from "@/components/workspace-navigation";
const groups:WorkspaceGroup[]=[
 {title:"Operação",items:[{id:"/painel",href:"/painel",icon:"chart",label:"Visão geral"},{id:"/painel/agenda",href:"/painel/agenda",icon:"calendar",label:"Agenda"},{id:"/painel/arenas",href:"/painel/arenas",icon:"field",label:"Arenas e espaços"}]},
 {title:"Ensino",items:[{id:"/painel/servicos",href:"/painel/servicos",icon:"field",label:"Serviços"},{id:"/painel/turmas",href:"/painel/turmas",icon:"calendar",label:"Turmas"},{id:"/painel/alunos",href:"/painel/alunos",icon:"users",label:"Alunos"},{id:"/painel/mensalidades",href:"/painel/mensalidades",icon:"wallet",label:"Mensalidades"}]},
 {title:"Em preparação",upcoming:true,items:[{id:"partners",icon:"link",label:"Convênios",disabled:true},{id:"billing",icon:"wallet",label:"Meu plano",disabled:true}]}
];
export function AdminNav(){const path=usePathname();const active=groups.flatMap(g=>g.items).find(i=>i.href&&(i.href==="/painel"?path===i.href:path===i.href||path.startsWith(i.href+"/")));return <WorkspaceNavigation groups={groups} activeId={active?.id??""}/>}
