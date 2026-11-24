export const TZ="America/Manaus";
export function today(){return new Intl.DateTimeFormat("en-CA",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date())}
export function validDate(s:string){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+"T12:00:00Z"))&&new Date(s+"T12:00:00Z").toISOString().slice(0,10)===s}
export function addDays(s:string,n:number){const d=new Date(s+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
export function labelDate(s:string){return new Intl.DateTimeFormat("pt-BR",{weekday:"long",day:"numeric",month:"long",timeZone:"UTC"}).format(new Date(s+"T12:00:00Z"))}
export function time(s:string){return new Intl.DateTimeFormat("pt-BR",{timeZone:TZ,hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(new Date(s))}
export function minutes(s:string){const [h,m]=time(s).split(":").map(Number);return h*60+m}
export function localDay(s:string){return new Intl.DateTimeFormat("en-CA",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(s))}
export function hh(m:number){return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0")}
