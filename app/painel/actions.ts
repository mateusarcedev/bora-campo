"use server";
import {requireOwner} from "@/lib/auth";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
export async function saveProfile(form:FormData){
 const {supabase,user}=await requireOwner();
 const name=String(form.get("name")??"").trim();
 if(name.length<2||name.length>120)redirect("/painel?mensagem=Nome%20inv%C3%A1lido");
 const {error}=await supabase.from("profiles").upsert({id:user.id,display_name:name},{onConflict:"id"});
 if(error)redirect("/painel?mensagem=N%C3%A3o%20foi%20poss%C3%ADvel%20salvar%20o%20perfil");
 revalidatePath("/painel");redirect("/painel?mensagem=Perfil%20atualizado");
}
