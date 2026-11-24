import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {APP_ORIGIN} from "@/lib/auth";
export async function GET(request:NextRequest){
 const code=request.nextUrl.searchParams.get("code");
 const recovery=request.nextUrl.searchParams.get("flow")==="recovery";
 if(code){const supabase=await createClient();const {error}=await supabase.auth.exchangeCodeForSession(code);
 if(!error)return NextResponse.redirect(APP_ORIGIN+(recovery?"/redefinir-senha":"/painel"));}
 return NextResponse.redirect(APP_ORIGIN+"/entrar?mensagem="+encodeURIComponent("Link inválido ou expirado. Abra o link no mesmo navegador ou solicite outro."));
}
