import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { normalizeName } from "@/lib/text";

export const runtime = "nodejs";

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){if(!(await requireAdminApi()))return NextResponse.json({error:"Não autorizado."},{status:401}); const {id}=await params; const b=await request.json().catch(()=>({})); const name=String(b.name||"").replace(/\s+/g," ").trim(); if(name.length<2)return NextResponse.json({error:"Informe um nome válido."},{status:400}); try{const result=getDb().prepare("UPDATE recipients SET name=?,normalized_name=?,phone=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(name,normalizeName(name),String(b.phone||"").trim()||null,Number(id)); if(!result.changes)return NextResponse.json({error:"Registro não encontrado."},{status:404}); return NextResponse.json({ok:true});}catch{return NextResponse.json({error:"Já existe uma pessoa com esse nome nesta lista."},{status:409});}}
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){if(!(await requireAdminApi()))return NextResponse.json({error:"Não autorizado."},{status:401}); const {id}=await params; getDb().prepare("DELETE FROM recipients WHERE id=?").run(Number(id)); return NextResponse.json({ok:true});}
