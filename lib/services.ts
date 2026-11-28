export const serviceTypes=[["group","Aulas em turma"],["individual","Aulas individuais"],["drop_in","Treino avulso"],["trial","Aula experimental"]] as const;
export const billingTypes=[["monthly","Mensalidade"],["per_session","Por aula"],["package","Pacote"],["free","Gratuito"]] as const;
export const serviceSports=[["society","Futebol society"],["volei","Vôlei"],["beach_tennis","Beach tennis"],["futevolei","Futevôlei"],["outro","Outra modalidade"]] as const;
export type ArenaService={id:string;arena_id:string;name:string;sport:string;service_type:string;billing_type:string;price_cents:number;description:string;active:boolean};
export const label=(options:readonly (readonly [string,string])[],value:string)=>options.find(x=>x[0]===value)?.[1]??value;
export function parseService(form:FormData){
 const v=(k:string)=>{const value=form.get(k);return typeof value==="string"?value.trim():""};
 const name=v("name"),sport=v("sport"),service_type=v("service_type"),billing_type=v("billing_type"),description=v("description"),raw=v("price").replace(",",".");
 if(name.length<2||name.length>100||description.length>1000||!serviceSports.some(x=>x[0]===sport)||!serviceTypes.some(x=>x[0]===service_type)||!billingTypes.some(x=>x[0]===billing_type)||!/^\d{1,6}(\.\d{1,2})?$/.test(raw))return null;
 const price_cents=Math.round(Number(raw)*100);
 if(billing_type==="free"&&price_cents!==0)return null;
 return {name,sport,service_type,billing_type,description,price_cents,active:v("active")==="on"};
}
export const serviceMoney=(cents:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(cents/100);
