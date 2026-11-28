"use client";
import Link from "next/link";
import {useId,useState} from "react";
import {Icon} from "@/components/ui";
export type WorkspaceItem={id:string;label:string;icon:string;href?:string;disabled?:boolean};
export type WorkspaceGroup={title:string;items:WorkspaceItem[];upcoming?:boolean};
export function WorkspaceNavigation({groups,activeId,onSelect,label="Menu administrativo"}:{groups:WorkspaceGroup[];activeId:string;onSelect?:(id:string)=>void;label?:string}){
 const [expanded,setExpanded]=useState(false),menuId=useId();
 const selected=groups.flatMap(g=>g.items).find(i=>i.id===activeId);
 const close=()=>setExpanded(false);
 return <div className="owner-navigation"><button type="button" className="owner-menu-toggle" aria-expanded={expanded} aria-controls={menuId} onClick={()=>setExpanded(v=>!v)}><span>{selected?.label??"Menu"}</span><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={expanded?"m6 15 6-6 6 6":"m6 9 6 6 6-6"}/></svg></button>
 <nav id={menuId} className={expanded?"owner-menu is-open":"owner-menu"} aria-label={label} onKeyDown={e=>{if(e.key==="Escape"&&expanded){close();const button=e.currentTarget.previousElementSibling;if(button instanceof HTMLButtonElement)button.focus()}}}>{groups.map(g=><section key={g.title} className={"owner-nav-group"+(g.upcoming?" owner-nav-upcoming":"")}><h2>{g.title}</h2>{g.items.map(i=>{const active=i.id===activeId,content=<><Icon name={i.icon}/><span>{i.label}</span></>,className=active?"admin-active":"";return i.disabled?<span key={i.id}>{content}</span>:i.href?<Link key={i.id} href={i.href} aria-current={active?"page":undefined} className={className} onClick={close}>{content}</Link>:<button key={i.id} type="button" aria-current={active?"page":undefined} className={className} onClick={()=>{onSelect?.(i.id);close()}}>{content}</button>})}</section>)}</nav></div>
}
