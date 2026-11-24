"use server";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {APP_ORIGIN,requireOwner} from "@/lib/auth";
const field=(form:FormData,name:string)=>{const v=form.get(name);return typeof v==="string"?v:""};
const emailField=(f:FormData)=>field(f,"email").trim().toLowerCase();
const validEmail=(v:string)=>v.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
function go(path:string,message:string){redirect(path+"?mensagem="+encodeURIComponent(message))}
export async function login(form:FormData){
 const email=emailField(form),password=field(form,"password");
 if(!validEmail(email)||!password||password.length>128)go("/entrar","Verifique o e-mail e a senha.");
 const supabase=await createClient();
 const {error}=await supabase.auth.signInWithPassword({email,password});
 if(error)go("/entrar","Não foi possível entrar. Confira seus dados e a confirmação do e-mail.");
 redirect("/painel");
}
export async function signup(form:FormData){
 const email=emailField(form),password=field(form,"password"),name=field(form,"name").trim();
 if(!validEmail(email)||name.length<2||name.length>120||password.length<10||password.length>128||password!==field(form,"confirmation"))go("/cadastro","Confira os campos. A senha deve ter entre 10 e 128 caracteres e coincidir com a confirmação.");
 const supabase=await createClient();
 const {data,error}=await supabase.auth.signUp({email,password,options:{data:{display_name:name},emailRedirectTo:APP_ORIGIN+"/auth/callback"}});
 if(error)go("/cadastro","Não foi possível cadastrar. Tente novamente mais tarde.");
 if(data.session)redirect("/painel");
 go("/entrar","Se o cadastro estiver disponível, confira seu e-mail para confirmar a conta.");
}
export async function recover(form:FormData){
 const email=emailField(form);
 if(!validEmail(email))go("/recuperar-senha","Informe um e-mail válido.");
 const supabase=await createClient();
 await supabase.auth.resetPasswordForEmail(email,{redirectTo:APP_ORIGIN+"/auth/callback?flow=recovery"});
 go("/recuperar-senha","Se existir uma conta elegível, você receberá instruções por e-mail. Verifique também o spam.");
}
export async function changePassword(form:FormData){
 const {supabase}=await requireOwner();
 const password=field(form,"password");
 if(password.length<10||password.length>128||password!==field(form,"confirmation"))go("/redefinir-senha","As senhas precisam coincidir e ter entre 10 e 128 caracteres.");
 const {error}=await supabase.auth.updateUser({password});
 if(error)go("/redefinir-senha","Não foi possível alterar a senha. Solicite um novo link.");
 await supabase.auth.signOut({scope:"local"});
 go("/entrar","Senha atualizada. Entre novamente.");
}
export async function logout(){const supabase=await createClient();const {error}=await supabase.auth.signOut({scope:"local"});if(error)redirect("/painel");redirect("/entrar");}
