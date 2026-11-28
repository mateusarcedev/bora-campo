import {requireOwner} from "@/lib/auth";
import {notFound} from "next/navigation";
export const uuid=(s:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
export const field=(f:FormData,k:string)=>String(f.get(k)??"").trim();
export async function ownedArena(arena:string){const ctx=await requireOwner();if(!uuid(arena))notFound();const {data,error}=await ctx.supabase.from("arenas").select("id").eq("id",arena).eq("owner_id",ctx.user.id).maybeSingle();if(error||!data)notFound();return ctx}
export async function ownerArenas(requested?:string){const ctx=await requireOwner();const result=await ctx.supabase.from("arenas").select("id,name").eq("owner_id",ctx.user.id).order("name");return {...ctx,arenas:result.data??[],arena:result.data?.find(a=>a.id===requested)??result.data?.[0],error:result.error}}
