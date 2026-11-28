import Link from "next/link";
import {requireOwner} from "@/lib/auth";
import {ServiceCatalog} from "@/components/service-catalog";
import type {ArenaService} from "@/lib/services";
export default async function Page({searchParams}:{searchParams:Promise<{arena?:string;mensagem?:string;erro?:string}>}){
 const {supabase,user}=await requireOwner(),q=await searchParams;
 const {data:arenas,error}=await supabase.from("arenas").select("id,name").eq("owner_id",user.id).order("name");
 const arena=arenas?.find(a=>a.id===q.arena)??arenas?.[0];
 return <><header className="admin-top"><div><span className="bc-eyebrow">Serviços e ensino</span><h1 className="bc-title">Serviços</h1><p className="bc-copy">Cadastre modalidades, valores e modelos de cobrança da sua arena.</p></div></header>{error?<p className="bc-info" role="alert">Não foi possível carregar suas arenas.</p>:!arena?<section className="bc-card admin-section"><h2>Cadastre sua arena primeiro</h2><Link href="/painel/arenas" className="bc-btn">Cadastrar arena</Link></section>:<><form method="get" className="bc-service-arena"><label className="bc-label">Arena<select className="bc-field" name="arena" defaultValue={arena.id}>{arenas?.map(a=><option value={a.id} key={a.id}>{a.name}</option>)}</select></label><button className="bc-btn bc-btn--outline">Selecionar</button></form>{typeof q.mensagem==="string"&&<p role="status" className="bc-info">{q.mensagem.slice(0,200)}</p>}{typeof q.erro==="string"&&<p role="alert" className="demo-error">{q.erro.slice(0,200)}</p>}<Catalog arena={arena.id}/></>}</>
}
async function Catalog({arena}:{arena:string}){
 const {supabase}=await requireOwner();
 const {data,error}=await supabase.from("arena_services").select("id,arena_id,name,sport,service_type,billing_type,price_cents,description,active").eq("arena_id",arena).order("created_at");
 if(error)return <p className="bc-info" role="alert">Não foi possível carregar os serviços. Atualize a página.</p>;
 return <ServiceCatalog key={arena} arena={arena} services={(data??[]) as ArenaService[]}/>;
}
