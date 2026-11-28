import assert from "node:assert/strict";import {parseService} from "../lib/services.ts";
const f=new FormData();for(const [k,v] of Object.entries({name:"Vôlei adulto",sport:"volei",service_type:"group",billing_type:"monthly",price:"140,50",active:"on"}))f.set(k,v);
assert.equal(parseService(f)?.price_cents,14050);
f.set("price","-1");assert.equal(parseService(f),null);f.set("price","140.50");f.set("billing_type","free");assert.equal(parseService(f),null);f.set("price","0");assert.equal(parseService(f)?.price_cents,0);f.set("sport","invalid");assert.equal(parseService(f),null);console.log("Service validation passed");
