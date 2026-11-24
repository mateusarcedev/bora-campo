"use server";
import {requireOwner} from "@/lib/auth";
import {redirect,notFound} from "next/navigation";
import {revalidatePath} from "next/cache";
import {validDate} from "@/lib/agenda";
const field=(f:FormData,k:string)=>String(f.get(k)??"").trim();
const uuid=(s:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
function done(arena:string,date:string,msg:string):never{revalidatePath("/painel/agenda");redirect("/painel/agenda?"+new URLSearchParams({arena,date,mensagem:msg}).toString());}
async function owner(arena:string){const ctx=await requireOwner();if(!uuid(arena))notFound();const {data,error}=await ctx.supabase.from("arenas").select("id").eq("id",arena).eq("owner_id",ctx.user.id).maybeSingle();if(error||!data)notFound();return ctx;}
export async function createEntry(form:FormData){const arena=field(form,"arena"),date=field(form,"date"),court=field(form,"court"),start=field(form,"start"),end=field(form,"end"),kind=field(form,"kind"),title=field(form,"title"),phone=field(form,"phone").replace(/\D/g,""),notes=field(form,"notes"),payment=field(form,"payment"),method=field(form,"method"),price=field(form,"price").replace(",",".");
const {supabase}=await owner(arena);if(!validDate(date)||!uuid(court)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(end)||start>=end||!["reservation","block"].includes(kind)||!title||title.length>160||notes.length>1000||(phone&&!/^\d{10,13}$/.test(phone)))done(arena,date,"Confira os dados e horários.");
const {data:c,error:ce}=await supabase.from("courts").select("id,active").eq("arena_id",arena).eq("id",court).maybeSingle();if(ce||!c?.active)done(arena,date,"Campo indisponível.");
const block=kind==="block";
if(!block&&(!/^\d{1,6}(\.\d{1,2})?$/.test(price)||!["paid","unpaid"].includes(payment)||!["local","pix"].includes(method)))done(arena,date,"Informe valor e situação do pagamento.");
const {error}=await supabase.from("calendar_entries").insert({arena_id:arena,court_id:court,kind,title,contact_phone:block?"":phone,notes,starts_at:date+"T"+start+":00-04:00",ends_at:date+"T"+end+":00-04:00",status:"confirmed",payment_status:block?"not_applicable":payment,payment_method:block?null:method,price_cents:block?0:Math.round(Number(price)*100),source:"manual"});done(arena,date,error?(error.code==="23P01"?"Horário ocupado. Atualize a agenda e escolha outro horário.":"Não foi possível salvar."):(block?"Horário bloqueado.":"Reserva manual registrada."));}
export async function changeEntry(arena:string,date:string,id:string,operation:string){const {supabase}=await owner(arena);if(!uuid(id)||!["cancel","paid","unpaid"].includes(operation))notFound();let q=supabase.from("calendar_entries").update(operation==="cancel"?{status:"cancelled"}:{payment_status:operation}).eq("arena_id",arena).eq("id",id).neq("status","cancelled");if(operation!=="cancel")q=q.eq("kind","reservation");const {data,error}=await q.select("id");done(arena,date,error||!data?.length?"Não foi possível atualizar.":operation==="cancel"?"Horário liberado.":"Pagamento atualizado.");}
