import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await requireAdminApi())) return NextResponse.json({error:"Não autorizado."},{status:401});
  const b=await request.json().catch(()=>({}));
  const title=String(b.title||"").trim(), arrival=String(b.arrivalDate||""), ret=String(b.returnDate||"");
  if(!title||!/^\d{4}-\d{2}-\d{2}$/.test(arrival)||!/^\d{4}-\d{2}-\d{2}$/.test(ret)) return NextResponse.json({error:"Preencha o nome e as datas corretamente."},{status:400});
  if(ret < arrival) return NextResponse.json({error:"A data de devolução não pode ser anterior à chegada."},{status:400});
  const result=getDb().prepare(`INSERT INTO package_lists (title,arrival_date,return_date,morning_open,morning_close,afternoon_open,afternoon_close,notes) VALUES (?,?,?,?,?,?,?,?)`).run(title,arrival,ret,String(b.morningOpen||"09:00"),String(b.morningClose||"12:00"),String(b.afternoonOpen||"14:00"),String(b.afternoonClose||"18:00"),String(b.notes||"").trim()||null);
  return NextResponse.json({id:Number(result.lastInsertRowid)},{status:201});
}
