import type {Metadata} from "next";
import {today} from "@/lib/agenda";
import {OwnerDemo} from "@/components/owner-demo";
export const metadata:Metadata={title:"Demonstração para proprietários",description:"Experimente a gestão de arenas BoraCampo com dados fictícios, sem cadastro.",robots:{index:false,follow:false},alternates:{canonical:"/demo"}};
export const dynamic="force-dynamic";
export default function Page(){return <OwnerDemo initialDate={today()}/>}
