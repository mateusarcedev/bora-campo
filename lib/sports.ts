export const sports=[{value:"society",label:"Futebol society"},{value:"volei",label:"Vôlei"},{value:"beach_tennis",label:"Beach tennis"},{value:"futevolei",label:"Futevôlei"}] as const;
export function sportLabel(value:string){return sports.find(s=>s.value===value)?.label??"Outra modalidade"}
