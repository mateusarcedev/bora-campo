export function normalizeBrazilianPhone(value?:string|null){
 const digits=(value??"").replace(/\D/g,"");
 if(/^[1-9]\d[2-9]\d{7,8}$/.test(digits))return "55"+digits;
 if(/^55[1-9]\d[2-9]\d{7,8}$/.test(digits))return digits;
 return null;
}
export function whatsappCandidate(phone?:string|null,whatsapp?:string|null){
 const confirmed=normalizeBrazilianPhone(whatsapp);
 const mobile=normalizeBrazilianPhone(phone);
 return confirmed?{number:confirmed,confirmed:true}:mobile&&/^55\d{2}9\d{8}$/.test(mobile)?{number:mobile,confirmed:false}:null;
}
