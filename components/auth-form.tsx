import type {ReactNode} from "react";
import {Brand,Pitch} from "@/components/ui";
export function AuthFrame({title,subtitle,message,children}:{title:string;subtitle:string;message?:string;children:ReactNode}){
 return <main className="auth-shell"><div className="auth-art"><Brand/><div><span className="bc-tag">Gestão de arenas esportivas</span><h2>Sua arena cheia.<br/>Sua gestão no controle.</h2><p>Organize campos, horários e reservas em um só lugar.</p><Pitch label="BoraCampo"/></div><small>Manaus, Amazonas · Pré-lançamento</small></div><section className="auth-content"><div className="auth-box"><Brand/><h1>{title}</h1><p className="bc-copy">{subtitle}</p>{message&&<div className="bc-info" role="status">{message}</div>}{children}</div></section></main>
}
export function Field({name,label,type="text",autoComplete,minLength,maxLength=254}:{name:string;label:string;type?:string;autoComplete?:string;minLength?:number;maxLength?:number}){return <label className="bc-label">{label}<input required className="bc-field" name={name} type={type} autoComplete={autoComplete} minLength={minLength} maxLength={maxLength}/></label>}
export type AuthSearch={searchParams:Promise<{mensagem?:string|string[]}>};
export async function messageFrom(props:AuthSearch){const q=await props.searchParams;return typeof q.mensagem==="string"?q.mensagem.slice(0,300):undefined}
