"use server";
import {requireOwner} from "@/lib/auth";
import {parseService} from "@/lib/services";
import {notFound} from "next/navigation";
import {revalidatePath} from "next/cache";
const route="/painel/servicos";
const uuid=(s:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
async function own(arena:string){
 const ctx=await requireOwner();
 if(!uuid(arena))notFound();
 const {data,error}=await ctx.supabase.from("arenas").select("id").eq("id",arena).eq("owner_id",ctx.user.id).maybeSingle();
 if(error||!data)notFound();return ctx;
}
export type ServiceSaveState={ok:boolean;message:string;};
export async function saveService(arena:string,id:string,_previous:ServiceSaveState,form:FormData):Promise<ServiceSaveState>{
 const {supabase}=await own(arena);const payload=parseService(form);
 if(!payload)return {ok:false,message:"Confira os campos. Serviços gratuitos devem ter valor zero."};
 if(id&&!uuid(id))notFound();
 const result=id?await supabase.from("arena_services").update(payload).eq("arena_id",arena).eq("id",id).select("id").maybeSingle():await supabase.from("arena_services").insert({...payload,arena_id:arena}).select("id").single();
 if(result.error||!result.data)return {ok:false,message:"Não foi possível salvar o serviço."};
 revalidatePath(route);return {ok:true,message:id?"Serviço atualizado.":"Serviço cadastrado."};
}
