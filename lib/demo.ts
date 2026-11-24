export type DemoCourt={id:string;name:string;sport:string;rate:number;active:boolean};
export type DemoEntry={id:string;court:string;date:string;start:number;end:number;title:string;kind:"reservation"|"block";paid:boolean;price:number};
export type DemoData={courts:DemoCourt[];entries:DemoEntry[];arena:string;neighborhood:string};
export const overlap=(a:DemoEntry,b:DemoEntry)=>a.court===b.court&&a.date===b.date&&a.start<b.end&&b.start<a.end;
export function addEntry(data:DemoData,entry:DemoEntry):DemoData{
 if(!data.courts.some(c=>c.id===entry.court&&c.active)||!entry.title.trim()||entry.title.length>100||!Number.isInteger(entry.start)||!Number.isInteger(entry.end)||entry.start<8*60||entry.end>23*60||entry.start>=entry.end||!Number.isFinite(entry.price)||entry.price<0)throw Error("Confira os dados e o horário (08h–23h).");
 if(data.entries.some(e=>overlap(e,entry)))throw Error("Horário indisponível: já existe uma reserva ou bloqueio.");
 return {...data,entries:[...data.entries,entry]};
}
export function initialDemo(date:string):DemoData{
 const courts=[{id:"c1",name:"Campo 01",sport:"society",rate:100,active:true},{id:"c2",name:"Campo 02",sport:"society",rate:120,active:true},{id:"c3",name:"Quadra de areia",sport:"beach_tennis",rate:80,active:true}];
 const entries:DemoEntry[]=[{id:"e1",court:"c1",date,start:9*60,end:10*60,title:"Equipe Verde",kind:"reservation",paid:true,price:100},{id:"e2",court:"c2",date,start:10*60,end:11*60,title:"Pelada dos Amigos",kind:"reservation",paid:false,price:120},{id:"e3",court:"c3",date,start:12*60,end:14*60,title:"Manutenção",kind:"block",paid:false,price:0},{id:"e4",court:"c1",date,start:18*60,end:19*60,title:"Futebol de quarta",kind:"reservation",paid:false,price:100},{id:"e5",court:"c2",date,start:19*60,end:20*60,title:"Time Azul",kind:"reservation",paid:true,price:120},{id:"e6",court:"c3",date,start:17*60,end:18*60,title:"Dupla de areia",kind:"reservation",paid:true,price:80}];
 return {courts,entries,arena:"Arena Exemplo",neighborhood:"Manaus"};
}
