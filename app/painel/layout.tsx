import type {Metadata} from "next";
import type {ReactNode} from "react";
import Link from "next/link";
import {Brand,Icon} from "@/components/ui";
import {logout} from "@/app/auth/actions";
import {requireOwner} from "@/lib/auth";
import {AdminNav} from "@/components/admin-nav";
import {WorkspaceIdentity} from "@/components/workspace-ui";
export const metadata:Metadata={robots:{index:false,follow:false,googleBot:{index:false,follow:false}}};
export const dynamic="force-dynamic";
export default async function Layout({children}:{children:ReactNode}){const {supabase,user}=await requireOwner();const {data}=await supabase.from("arenas").select("name").eq("owner_id",user.id).order("name").limit(2);
return <div className="admin-shell owner-shell"><a className="owner-skip" href="#owner-main">Pular para conteúdo</a><aside className="admin-sidebar owner-sidebar"><div className="owner-brand-row"><Brand/><span className="owner-workspace-label">GESTÃO</span></div><WorkspaceIdentity label="Seu espaço de trabalho" name={data?.length===1?data[0].name:data?.length&&data.length>1?"Minhas arenas":"Minha operação"}/><AdminNav/><div className="owner-account"><Link className="owner-external" href="/"><Icon name="link"/>Ver marketplace</Link><div className="owner-account-row"><span className="owner-avatar" aria-hidden="true">{user.email?.slice(0,1).toUpperCase()||"P"}</span><div><strong>Minha conta</strong><span title={user.email}>{user.email}</span></div><form action={logout}><button type="submit" className="owner-signout" aria-label="Sair da conta" title="Sair da conta">Sair</button></form></div><p className="owner-account-note">Planos e cobrança em preparação.</p></div></aside><main id="owner-main" tabIndex={-1} className="admin-main owner-main">{children}</main></div>}
