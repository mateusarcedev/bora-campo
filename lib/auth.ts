import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
export const APP_ORIGIN="https://bora-campo.vercel.app";
export async function requireOwner(){
 const supabase=await createClient();
 const {data:{user},error}=await supabase.auth.getUser();
 if(error||!user) redirect("/entrar");
 return {supabase,user};
}
