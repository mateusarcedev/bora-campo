export type DemoCourt={id:string;name:string;sport:string;rate:number;active:boolean};
export type DemoEntry={id:string;court:string;date:string;start:number;end:number;title:string;kind:"reservation"|"block"|"class";paid:boolean;price:number};
export type DemoData={courts:DemoCourt[];entries:DemoEntry[];arena:string;neighborhood:string;services:DemoService[];classes:DemoClass[];students:DemoStudent[];partners:DemoPartner[];payments:Record<string,boolean>;attendance:Record<string,boolean>;access:Record<string,boolean>;publicPrices:boolean;publicClasses:boolean;publicPartners:boolean;requests:DemoRequest[]};
export const overlap=(a:DemoEntry,b:DemoEntry)=>a.court===b.court&&a.date===b.date&&a.start<b.end&&b.start<a.end;
export function addEntry(data:DemoData,entry:DemoEntry):DemoData{
 if(!data.courts.some(c=>c.id===entry.court&&c.active)||!entry.title.trim()||entry.title.length>100||!Number.isInteger(entry.start)||!Number.isInteger(entry.end)||entry.start<8*60||entry.end>23*60||entry.start>=entry.end||!Number.isFinite(entry.price)||entry.price<0)throw Error("Confira os dados e o horário (08h–23h).");
 if([...data.entries,...classEntries(data,entry.date)].some(e=>overlap(e,entry)))throw Error("Horário indisponível: já existe uma reserva, aula ou bloqueio.");
 return {...data,entries:[...data.entries,entry]};
}
export function initialDemo(date:string):DemoData{
 const courts=[{id:"c1",name:"Campo 01",sport:"society",rate:100,active:true},{id:"c2",name:"Campo 02",sport:"society",rate:120,active:true},{id:"c3",name:"Quadra de areia",sport:"beach_tennis",rate:80,active:true},{id:"c4",name:"Quadra de vôlei",sport:"volei",rate:80,active:true}];
 const entries:DemoEntry[]=[{id:"e1",court:"c1",date,start:9*60,end:10*60,title:"Equipe Verde",kind:"reservation",paid:true,price:100},{id:"e2",court:"c2",date,start:10*60,end:11*60,title:"Pelada dos Amigos",kind:"reservation",paid:false,price:120},{id:"e3",court:"c3",date,start:12*60,end:14*60,title:"Manutenção",kind:"block",paid:false,price:0},{id:"e4",court:"c1",date,start:18*60,end:19*60,title:"Futebol de quarta",kind:"reservation",paid:false,price:100},{id:"e5",court:"c2",date,start:19*60,end:20*60,title:"Time Azul",kind:"reservation",paid:true,price:120},{id:"e6",court:"c3",date,start:17*60,end:18*60,title:"Dupla de areia",kind:"reservation",paid:true,price:80}];
 const day=weekday(date),days=[day,(day+2)%7].sort((a,b)=>a-b);
 const services:DemoService[]=[{id:"s1",name:"Escolinha de futebol",sport:"society",type:"Turma",price:160,public:true},{id:"s2",name:"Vôlei para adultos",sport:"volei",type:"Turma",price:140,public:true},{id:"s3",name:"Beach tennis",sport:"beach_tennis",type:"Turma",price:180,public:true},{id:"s4",name:"Treino individual",sport:"society",type:"Individual",price:90,public:true},{id:"s5",name:"Aula experimental",sport:"volei",type:"Experimental",price:0,public:true}];
 const classes:DemoClass[]=[{id:"t1",service:"s1",name:"Futebol sub-12",teacher:"João Lima",court:"c1",days,start:960,end:1020,capacity:12,level:"Infantil",from:date},{id:"t2",service:"s2",name:"Vôlei iniciante",teacher:"Ana Costa",court:"c4",days,start:1080,end:1140,capacity:8,level:"Iniciante · adulto",from:date},{id:"t3",service:"s3",name:"Beach tennis iniciante",teacher:"Pedro Dias",court:"c3",days,start:1140,end:1200,capacity:6,level:"Iniciante",from:date}];
 const students:DemoStudent[]=[{id:"a1",name:"Aluno Exemplo 01",classId:"t1",origin:"Particular",due:10,guardian:"Responsável Exemplo"},{id:"a2",name:"Aluno Exemplo 02",classId:"t2",origin:"Particular",due:10,guardian:""},{id:"a3",name:"Aluno Exemplo 03",classId:"t2",origin:"TotalPass",due:10,guardian:""},{id:"a4",name:"Aluno Exemplo 04",classId:"t2",origin:"Wellhub",due:10,guardian:""},{id:"a5",name:"Aluno Exemplo 05",classId:"t3",origin:"Particular",due:28,guardian:""}];
 return {courts,entries,arena:"Arena Exemplo",neighborhood:"Manaus",services,classes,students,partners:[{name:"TotalPass",active:true,serviceIds:["s2","s3"],conditions:"Confirme seu plano com a recepção."},{name:"Wellhub",active:true,serviceIds:["s2"],conditions:"Acesso sujeito à validação do parceiro."}],payments:{[date.slice(0,7)+":a1"]:true},attendance:{},access:{},publicPrices:true,publicClasses:true,publicPartners:true,requests:[]};
}

export type DemoService={id:string;name:string;sport:string;type:"Turma"|"Individual"|"Avulsa"|"Experimental";price:number;public:boolean};
export type DemoClass={id:string;service:string;name:string;teacher:string;court:string;days:number[];start:number;end:number;capacity:number;level:string;from:string};
export type DemoStudent={id:string;name:string;classId:string;origin:"Particular"|"TotalPass"|"Wellhub";due:number;guardian:string};
export type DemoPartner={name:"TotalPass"|"Wellhub";active:boolean;serviceIds:string[];conditions:string};
export type DemoRequest={id:string;classId:string;name:string;type:"Matrícula"|"Experimental"|"Lista de espera";origin:DemoStudent["origin"]};
export const weekday=(date:string)=>new Date(date+"T12:00:00Z").getUTCDay();
export const occurs=(c:DemoClass,date:string)=>date>=c.from&&c.days.includes(weekday(date));
export const classEntries=(data:DemoData,date:string):DemoEntry[]=>data.classes.filter(c=>occurs(c,date)).map(c=>({id:"class:"+c.id+":"+date,court:c.court,date,start:c.start,end:c.end,title:c.name,kind:"class",paid:false,price:0}));
const timesOverlap=(a:{start:number;end:number},b:{start:number;end:number})=>a.start<b.end&&b.start<a.end;
export function saveService(data:DemoData,s:DemoService):DemoData{
 if(!s.name.trim()||s.name.length>100||!Number.isFinite(s.price)||s.price<0)throw Error("Informe nome e valor válidos.");
 return {...data,services:data.services.some(x=>x.id===s.id)?data.services.map(x=>x.id===s.id?s:x):[...data.services,s]};
}
export function addClass(data:DemoData,c:DemoClass):DemoData{
 if(!c.name.trim()||!c.teacher.trim()||!data.services.some(s=>s.id===c.service&&s.type==="Turma")||!data.courts.some(x=>x.id===c.court&&x.active)||!c.days.length||c.days.some(x=>!Number.isInteger(x)||x<0||x>6)||!Number.isInteger(c.capacity)||c.capacity<1||!Number.isInteger(c.start)||!Number.isInteger(c.end)||c.start<480||c.end>1380||c.start>=c.end||!/^\d{4}-\d{2}-\d{2}$/.test(c.from)||!Number.isFinite(Date.parse(c.from)))throw Error("Confira serviço, professor, capacidade e horário (08h–23h).");
 if(data.entries.some(e=>e.court===c.court&&occurs(c,e.date)&&timesOverlap(c,e)))throw Error("Horário indisponível: existe uma reserva ou bloqueio.");
 if(data.classes.some(x=>x.days.some(d=>c.days.includes(d))&&timesOverlap(x,c)&&(x.court===c.court||x.teacher.trim().toLowerCase()===c.teacher.trim().toLowerCase())))throw Error("Horário indisponível: conflito de espaço ou professor.");
 return {...data,classes:[...data.classes,c]};
}
export const studentCount=(data:DemoData,id:string)=>data.students.filter(s=>s.classId===id).length;
export function enroll(data:DemoData,s:DemoStudent):DemoData{
 const c=data.classes.find(x=>x.id===s.classId);
 if(!c||!s.name.trim()||s.name.length>100||!Number.isInteger(s.due)||s.due<1||s.due>28)throw Error("Confira os dados da matrícula.");
 if(studentCount(data,c.id)>=c.capacity)throw Error("Turma lotada. Utilize a lista de espera.");
 if(s.origin!=="Particular"&&!data.partners.some(p=>p.name===s.origin&&p.active&&p.serviceIds.includes(c.service)))throw Error("Convênio não habilitado para este serviço.");
 return {...data,students:[...data.students,s]};
}
