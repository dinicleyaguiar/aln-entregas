import Link from "next/link";
import { notFound } from "next/navigation";
import { getList, getRecipients } from "@/lib/data";
import { daysRemaining, deadlineLabel, formatDateBR } from "@/lib/date";
import { ListManager } from "@/components/list-manager";
import { DeleteListButton } from "@/components/delete-list-button";

export default async function ListDetailPage({ params }: { params: Promise<{id:string}> }) {
  const {id}=await params; const numericId=Number(id); const found=getList(numericId); if(!found)notFound(); const list=found!; const recipients=getRecipients(numericId); const days=daysRemaining(list.return_date);
  return <div className="space-y-6"><div><Link href="/admin/listas" className="text-sm font-bold text-teal-700">← Voltar para listas</Link><div className="mt-4 flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-3xl font-black">{list.title}</h1>{list.status === "ARQUIVADA" && <span className="badge bg-slate-100 text-slate-600">Arquivada</span>}</div><p className="mt-2 text-sm text-slate-600">Chegada em {formatDateBR(list.arrival_date)} · Devolução em {formatDateBR(list.return_date)}</p></div><span className={`badge ${days<0?"bg-red-50 text-red-700":days<=2?"bg-amber-50 text-amber-700":"bg-teal-50 text-teal-700"}`}>{deadlineLabel(days)}</span></div></div>
    <section className="card p-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Info label="Manhã" value={`${list.morning_open} às ${list.morning_close}`}/><Info label="Tarde" value={`${list.afternoon_open} às ${list.afternoon_close}`}/><Info label="Total de nomes" value={String(recipients.length)}/><Info label="Recebidos" value={String(recipients.filter(r=>r.status==="RECEBIDO").length)}/></div>{list.notes && <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{list.notes}</div>}<div className="mt-5 flex flex-wrap gap-2"><Link href={`/admin/listas/${list.id}/editar`} className="btn btn-secondary">Editar lista</Link><DeleteListButton id={list.id}/></div></section>
    <ListManager listId={list.id} initialRecipients={recipients}/>
  </div>;
}
function Info({label,value}:{label:string;value:string}){return <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div><div className="mt-1 font-black">{value}</div></div>}
