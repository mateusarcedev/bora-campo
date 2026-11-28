"use client";
import {useFormStatus} from "react-dom";
export function SubmitButton({label,disabled=false,outline=false}:{label:string;disabled?:boolean;outline?:boolean}){const {pending}=useFormStatus();return <button className={"bc-btn"+(outline?" bc-btn--outline":"")} disabled={disabled||pending} aria-busy={pending}>{pending?"Salvando…":label}</button>}
