"use client";
import {useId,useRef} from "react";
import {Icon} from "@/components/ui";

function normalizeBrazilianPhone(value?:string|null){
 const digits=(value??"").replace(/\D/g,"");
 if(/^[1-9]\d[2-9]\d{7,8}$/.test(digits))return "55"+digits;
 if(/^55[1-9]\d[2-9]\d{7,8}$/.test(digits))return digits;
 return null;
}
export function ArenaContact({name,phone,whatsapp,outline=false}:{name:string;phone?:string|null;whatsapp?:string|null;outline?:boolean}){
 const dialog=useRef<HTMLDialogElement>(null);const trigger=useRef<HTMLButtonElement>(null);const heading=useId();
 const call=normalizeBrazilianPhone(phone);
 const confirmed=normalizeBrazilianPhone(whatsapp);
 const chat=confirmed??call;
 if(!call&&!chat)return null;
 const close=()=>dialog.current?.close();
 return <><button ref={trigger} type="button" className={"bc-btn"+(outline?" bc-btn--outline":"")} aria-haspopup="dialog" onClick={()=>dialog.current?.showModal()}><Icon name="phone"/> Ligar / WhatsApp</button>
 <dialog ref={dialog} aria-labelledby={heading} className="contact-dialog" onClose={()=>trigger.current?.focus()} onClick={e=>{if(e.target===e.currentTarget)close()}}>
 <div className="contact-dialog-inner"><div className="contact-dialog-head"><div><h2 id={heading}>Entrar em contato</h2><p className="bc-copy">{name}</p></div><button type="button" className="contact-close" aria-label="Fechar opções de contato" onClick={close}>×</button></div>
 <p className="bc-copy">Escolha como deseja falar diretamente com a arena.</p>
 {call&&<a href={"tel:+"+call} className="contact-option" onClick={close}><span className="contact-symbol"><Icon name="phone"/></span><span><strong>Fazer ligação</strong><small>+{call.slice(0,2)} ({call.slice(2,4)}) {call.slice(4,-4)}-{call.slice(-4)}</small></span><span aria-hidden="true">›</span></a>}
 {chat&&<a href={"https://wa.me/"+chat} target="_blank" rel="noopener noreferrer" className="contact-option contact-whatsapp" onClick={close}><span className="contact-symbol"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.5 11.5a8.5 8.5 0 0 1-12.9 7.3L3 20l1.3-4.4a8.5 8.5 0 1 1 16.2-4.1Z"/><path d="M8.1 7.8c-.9.5-.9 2.2.6 4.2 1.5 2 4 3.7 5.6 3.3.7-.2 1.3-.8 1.5-1.5l-2.5-1.3-1 1c-1.5-.8-2.6-2-3-3.3l.8-.8-.9-2Z"/></svg></span><span><strong>Abrir WhatsApp</strong><small>{confirmed?"Conversar pelo WhatsApp":"Tentar conversar • número não confirmado no WhatsApp"}</small></span><span aria-hidden="true">›</span></a>}
 <button type="button" className="bc-btn bc-btn--outline contact-cancel" onClick={close}>Cancelar</button></div></dialog></>
}
