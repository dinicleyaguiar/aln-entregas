import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { getDb } from "@/lib/db";
export const runtime="nodejs";
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){if(!(await requireAdminApi()))return NextResponse.json({error:"Não autorizado."},{status:401}); const {id}=await params; const db=getDb(); const row=db.prepare("SELECT status FROM recipients WHERE id=?").get(Number(id)) as {status:string}|undefined; if(!row)return NextResponse.json({error:"Registro não encontrado."},{status:404}); const received=row.status!=="RECEBIDO"; db.prepare("UPDATE recipients SET status=?,received_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(received?"RECEBIDO":"AGUARDANDO",received?new Date().toISOString():null,Number(id)); return NextResponse.json({ok:true,status:received?"RECEBIDO":"AGUARDANDO"});}
