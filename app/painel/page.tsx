import Link from "next/link";
import {requireOwner} from "@/lib/auth";
import {today,addDays,time,labelDate} from "@/lib/agenda";
import {saveProfile} from "./actions";
import {Icon} from "@/components/ui";
import {SubmitButton} from "@/components/submit-button";
function Metric({label,value,description,icon}:{label:string;value:string|number;description:string;icon:string}){return <div className="owner-metric"><div><span>{label}</span><Icon name={icon}/></div><strong>{value}</strong><small>{description}</small></div>}
export default async function Page({searchParams}:{searchParams:Promise<{mensagem?:string|string[]}>}){
 const {supabase,user}=await requireOwner(),q=await searchParams;
 const [profile,arenas]=await Promise.all([supabase.from("profiles").select("display_name").eq("id",user.id).maybeSingle(),supabase.from("arenas").select("id,name,slug,neighborhood,published").eq("owner_id",user.id).order("created_at")]);
 const owned=arenas.data??[],ids=owned.map(a=>a.id),date=today(),start=date+"T00:00:00-04:00",end=addDays(date,1)+"T00:00:00-04:00",now=new Date().toISOString(),month=date.slice(0,7)+"-01";
 const empty={count:0,error:null};const emptyRows={data:[],error:null};
 const [reservations,classes,students,tuition,upcoming]=ids.length?await Promise.all([
 supabase.from("calendar_entries").select("id",{count:"exact",head:true}).in("arena_id",ids).eq("kind","reservation").neq("status","cancelled").lt("starts_at",end).gt("ends_at",start),
 supabase.from("calendar_entries").select("id",{count:"exact",head:true}).in("arena_id",ids).not("class_id","is",null).eq("status","confirmed").lt("starts_at",end).gt("ends_at",start),
 supabase.from("arena_students").select("id",{count:"exact",head:true}).in("arena_id",ids),
 supabase.from("arena_tuition").select("id",{count:"exact",head:true}).in("arena_id",ids).eq("competence",month).is("paid_at",null),
 supabase.from("calendar_entries").select("id,arena_id,court_id,title,kind,class_id,starts_at,ends_at,payment_status,price_cents").in("arena_id",ids).neq("status","cancelled").gte("starts_at",now).lt("starts_at",end).or("kind.eq.reservation,class_id.not.is.null").order("starts_at").limit(8)
 ]):[empty,empty,empty,empty,emptyRows];
 const count=(r:{count:number|null;error:unknown})=>arenas.error||r.error?"—":r.count??"—";
 const name=profile.data?.display_name?.trim().split(/\s+/)[0];
 return <div className="owner-dashboard">
 <header className="owner-page-heading"><div><p className="owner-date">{labelDate(date)} · Manaus</p><h1>Visão geral</h1><p>{name?"Olá, "+name+". ":""}Acompanhe a operação de todas as suas arenas.</p></div><Link className="bc-btn" href="/painel/agenda">Abrir agenda <span aria-hidden="true">→</span></Link></header>
 {typeof q.mensagem==="string"&&<p className="bc-info" role="status">{q.mensagem.slice(0,300)}</p>}
 {arenas.error&&<p role="alert" className="bc-info">Não foi possível consultar suas arenas. Atualize a página.</p>}
 {!arenas.error&&!ids.length&&<section className="owner-onboard"><div><h2>Prepare sua primeira arena</h2><p>Cadastre os espaços, horários e preços para começar a organizar as reservas.</p></div><Link href="/painel/arenas" className="bc-btn">Cadastrar arena</Link></section>}
 <section className="owner-metrics" aria-label="Indicadores da operação"><Metric label="Reservas hoje" value={count(reservations)} description="Não canceladas" icon="calendar"/><Metric label="Aulas hoje" value={count(classes)} description="Ocorrências confirmadas" icon="clock"/><Metric label="Alunos cadastrados" value={count(students)} description="Todas as suas arenas" icon="users"/><Metric label="Mensalidades em aberto" value={count(tuition)} description="Competência atual · já geradas" icon="wallet"/></section>
 <div className="owner-dashboard-grid"><section className="owner-panel"><header><div><h2>Próximos horários</h2><p>Reservas e aulas até o final de hoje</p></div><Link className="auth-link" href="/painel/agenda">Ver agenda →</Link></header>{upcoming.error||arenas.error?<p className="owner-empty" role="alert">Não foi possível consultar os horários.</p>:!upcoming.data?.length?<div className="owner-empty"><Icon name="calendar"/><strong>Nenhuma atividade restante hoje</strong><p>As próximas reservas e aulas aparecerão aqui.</p></div>:<div className="owner-table-scroll"><table className="owner-table"><thead><tr><th>Horário</th><th>Atividade</th><th>Situação</th></tr></thead><tbody>{upcoming.data.map(e=><tr key={e.id}><td className="owner-tabular">{time(e.starts_at)}<small>até {time(e.ends_at)}</small></td><td><strong>{e.title||(e.class_id?"Aula":"Reserva")}</strong><small>{owned.find(a=>a.id===e.arena_id)?.name??"Arena"}</small></td><td><span className={"owner-status "+(e.class_id?"lesson":e.payment_status==="paid"?"success":"pending")}>{e.class_id?"Aula":e.payment_status==="paid"?"Pago":"Pendente"}</span></td></tr>)}</tbody></table></div>}</section>
 <section className="owner-panel"><header><div><h2>Minhas arenas</h2><p>{owned.length} cadastrada(s)</p></div><Link className="auth-link" href="/painel/arenas">Gerenciar →</Link></header>{arenas.error?<p className="owner-empty">Consulta indisponível.</p>:!owned.length?<div className="owner-empty"><Icon name="field"/><strong>Nenhuma arena cadastrada</strong></div>:<div className="owner-arena-list">{owned.map(a=><div key={a.id}><div><strong>{a.name}</strong><small>{a.neighborhood}</small></div><span className={"owner-status "+(a.published?"success":"neutral")}>{a.published?"Publicada":"Rascunho"}</span></div>)}</div>}<div className="owner-shortcuts"><Link href="/painel/servicos"><Icon name="field"/>Serviços<span>→</span></Link><Link href="/painel/turmas"><Icon name="calendar"/>Turmas<span>→</span></Link><Link href="/painel/mensalidades"><Icon name="wallet"/>Mensalidades<span>→</span></Link></div></section></div>
 <details className="owner-profile"><summary>Meu perfil <span>Editar dados de exibição</span></summary><p className="bc-copy">{user.email}</p>{profile.error?<p role="alert" className="bc-info">Não foi possível carregar o perfil.</p>:<form action={saveProfile} className="owner-profile-form"><label className="bc-label">Nome de exibição<input className="bc-field" name="name" minLength={2} maxLength={120} required defaultValue={profile.data?.display_name??""}/></label><SubmitButton label="Salvar perfil"/></form>}</details>
 </div>
}
