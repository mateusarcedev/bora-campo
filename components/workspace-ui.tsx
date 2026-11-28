import type {ReactNode} from "react";
import {Icon} from "@/components/ui";
export function WorkspaceMetric({label,value,description,icon}:{label:string;value:string|number;description:string;icon:string}){return <div className="owner-metric"><div><span>{label}</span><Icon name={icon}/></div><strong>{value}</strong><small>{description}</small></div>}
export function WorkspaceStatus({tone="neutral",children}:{tone?:"success"|"pending"|"lesson"|"neutral";children:ReactNode}){return <span className={"owner-status "+tone}>{children}</span>}
export function WorkspaceIdentity({label,name}:{label:string;name:string}){return <div className="owner-workspace"><span className="owner-workspace-icon"><Icon name="field"/></span><div><small>{label}</small><strong>{name}</strong></div></div>}
