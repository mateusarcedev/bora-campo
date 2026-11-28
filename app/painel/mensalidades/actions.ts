"use server";
import {ownedArena,uuid} from "@/lib/owner-arena";
import {validDate} from "@/lib/agenda";
import {redirect,notFound} from "next/navigation";
import {revalidatePath} from "next/cache";
function done(arena:string,month:string,message:string,error=false):never{revalidatePath("/painel/mensalidades");redirect("/painel/mensalidades?"+new URLSearchParams({arena,month,[error?"erro":"mensagem"]:message}).toString())}
export async function generateTuition(arena:string,month:string){const {supabase}=await ownedArena(arena);if(!validDate(month+"-01"))notFound();const {data,error}=await supabase.rpc("generate_arena_tuition",{p_arena:arena,p_month:month+"-01"});done(arena,month,error?"Não foi possível gerar mensalidades.":String(data??0)+" mensalidade(s) gerada(s). Registros existentes preservados.",!!error)}
export async function markTuition(arena:string,month:string,id:string,paid:boolean){const {supabase}=await ownedArena(arena);if(!uuid(id)||!validDate(month+"-01"))notFound();const {data,error}=await supabase.from("arena_tuition").update({paid_at:paid?new Date().toISOString():null}).eq("arena_id",arena).eq("id",id).eq("competence",month+"-01").select("id");done(arena,month,error||!data?.length?"Não foi possível atualizar.":paid?"Recebimento registrado.":"Mensalidade marcada como pendente.",!!error||!data?.length)}
