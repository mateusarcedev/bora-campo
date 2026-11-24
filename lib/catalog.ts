export type Court={id:string;name:string;sport:string;active:boolean};
export type Arena={id:string;slug:string;name:string;neighborhood:string;description:string;city:string;courts:Court[]};
export async function catalog(bairro?:string,modalidade?:string,slug?:string):Promise<{arenas:Arena[];error:boolean}>{
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)return {arenas:[],error:true};
const q=new URLSearchParams({select:"id,slug,name,neighborhood,description,city,courts(id,name,sport,active)",published:"eq.true",city:"eq.Manaus",order:"name.asc",limit:"100"});if(slug)q.set("slug","eq."+slug);
try{const r=await fetch(new URL("/rest/v1/arenas?"+q.toString(),url),{headers:{apikey:key},cache:"no-store"});if(!r.ok)return {arenas:[],error:true};const rows=await r.json() as Arena[];const b=(bairro??"").trim().toLocaleLowerCase("pt-BR");return {arenas:rows.filter(a=>(!b||a.neighborhood.toLocaleLowerCase("pt-BR").includes(b))&&(!modalidade||a.courts.some(c=>c.active&&c.sport===modalidade))),error:false};}catch{return {arenas:[],error:true};}}
