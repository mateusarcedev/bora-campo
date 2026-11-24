import type {Metadata} from "next";import type {ReactNode} from "react";import "./globals.css";
const origin="https://bora-campo.vercel.app";
const title="BoraCampo | Campos de futebol e quadras em Manaus";
const description="Encontre campos de futebol society, beach tennis, vôlei e futevôlei em Manaus. Descubra arenas próximas, consulte endereços e fale com os estabelecimentos.";
const indexable=process.env.VERCEL_ENV!=="preview";
export const metadata:Metadata={metadataBase:new URL(origin),title:{default:title,template:"%s | BoraCampo"},description,applicationName:"BoraCampo",alternates:{canonical:"/"},robots:{index:indexable,follow:indexable,googleBot:{index:indexable,follow:indexable,"max-image-preview":"large"}},openGraph:{type:"website",locale:"pt_BR",url:origin,siteName:"BoraCampo",title,description,images:[{url:"/opengraph-image",width:1200,height:630,alt:"BoraCampo — "+"Encontre campos e quadras em Manaus."}]},twitter:{card:"summary_large_image",title,description,images:["/opengraph-image"]}};
export default function Layout({children}:{children:ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
