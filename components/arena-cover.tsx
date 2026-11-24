"use client";
import {useState} from "react";
import {sportLabel} from "@/lib/sports";

const order=["society","beach_tennis","volei","futevolei"];
function choose(sports:string[],preferred?:string){
 if(preferred&&sports.includes(preferred)&&order.includes(preferred))return preferred;
 return order.find(s=>sports.includes(s))??"outro";
}
function SportDrawing({sport}:{sport:string}){
 return <svg viewBox="0 0 360 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="arena-cover-art">
 <rect width="360" height="150" fill="currentColor" opacity=".10"/>
 {Array.from({length:12},(_,i)=><path key={i} d={"M"+(i*42-110)+" 150l150 -150"} stroke="currentColor" strokeWidth="20" opacity=".035"/>)}
 <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".32">
 <rect x="22" y="12" width="316" height="126" rx="8"/>
 {sport==="society"?<><path d="M180 12v126M22 39h48v72H22M338 39h-48v72h48"/><circle cx="180" cy="75" r="30"/><path d="M22 54h17v42H22M338 54h-17v42h17"/></>:<><path d="M180 12v126M126 12v126M234 12v126"/>{sport==="beach_tennis"&&<path d="M22 75h316"/>}</>}
 </g>
 <circle cx="180" cy="66" r="34" fill="var(--cover-disc)"/>
 <g transform="translate(160 46)" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
 {sport==="society"?<><circle cx="20" cy="20" r="17"/><path d="m20 12 8 6-3 9H15l-3-9zM20 12V3M28 18l9-3M25 27l5 8M15 27l-5 8M12 18l-9-3"/></>:sport==="beach_tennis"?<><ellipse cx="15" cy="13" rx="10" ry="13" transform="rotate(35 15 13)"/><path d="m10 24-7 12M14 26l-7 12M9 9l10 7M13 5l9 6M6 14l10 7"/><circle cx="31" cy="28" r="6"/><path d="M26 25q7-2 9 6"/></>:sport==="volei"||sport==="futevolei"?<><circle cx="20" cy="20" r="17"/><path d="M20 20c-9-4-13-10-11-13M20 20c1 9-2 15-5 16M20 20c9-5 15-4 17 0M14 16c-3 6-7 9-10 9M24 13c-2-6-2-8-1-10M26 25c4 4 5 7 5 10"/>{sport==="futevolei"&&<path d="M5 39h30"/>}</>:<><rect x="3" y="7" width="34" height="26" rx="4"/><path d="M20 7v26"/><circle cx="20" cy="20" r="5"/></>}
 </g></svg>;
}
export function ArenaCover({name,sports,src,preferred,compact=false}:{name:string;sports:string[];src?:string;preferred?:string;compact?:boolean}){
 const [failed,setFailed]=useState<string|null>(null);
 const sport=choose(sports,preferred);
 const label=sport==="outro"?"Arena esportiva":sportLabel(sport);
 if(src&&failed!==src)return <img className="arena-cover-real" src={src} alt={"Foto de "+name} loading="lazy" decoding="async" onError={()=>setFailed(src)}/>;
 return <div className={"arena-cover-placeholder cover-"+sport+(compact?" cover-compact":"")} role="img" aria-label={"Ilustração de "+label+"; foto da arena indisponível"}><SportDrawing sport={sport}/>{!compact&&<><span className="arena-cover-modality">{label}</span><span className="arena-cover-caption">Imagem ilustrativa</span></>}</div>;
}
