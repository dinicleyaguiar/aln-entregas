import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { normalizeName, parseNames } from "@/lib/text";

export const runtime = "nodejs";

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){if(!(await requireAdminApi()))return NextResponse.json({error:"Não autorizado."},{status:401}); const {id}=await params; const recipients=getDb().prepare("SELECT id,name,phone,status,received_at FROM recipients WHERE list_id=? ORDER BY normalized_name").all(Number(id)); return NextResponse.json({recipients});}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){if(!(await requireAdminApi()))return NextResponse.json({error:"Não autorizado."},{status:401}); const {id}=await params; const b=await request.json().catch(()=>({})); const names=parseNames(String(b.text||"")); if(!names.length)return NextResponse.json({error:"Cole pelo menos um nome válido."},{status:400}); const db=getDb(); const exists=db.prepare("SELECT id FROM package_lists WHERE id=?").get(Number(id)); if(!exists)return NextResponse.json({error:"Lista não encontrada."},{status:404}); const insert=db.prepare("INSERT OR IGNORE INTO recipients (list_id,name,normalized_name) VALUES (?,?,?)"); let inserted=0; db.exec("BEGIN"); try{for(const name of names){const result=insert.run(Number(id),name,normalizeName(name)); inserted+=Number(result.changes);} db.exec("COMMIT");}catch(error){if(db.isTransaction)db.exec("ROLLBACK"); throw error;} return NextResponse.json({inserted,skipped:names.length-inserted});}
