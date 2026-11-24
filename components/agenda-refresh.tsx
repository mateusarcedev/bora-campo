"use client";
import {useEffect} from "react";import {useRouter} from "next/navigation";
export function AgendaRefresh(){const router=useRouter();useEffect(()=>{const timer=setInterval(()=>{if(document.visibilityState==="visible"&&!document.querySelector("form:focus-within")&&!document.querySelector("details[open]"))router.refresh()},30000);return()=>clearInterval(timer)},[router]);return null}
