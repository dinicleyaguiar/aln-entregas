import { notFound } from "next/navigation";
import { ListForm } from "@/components/list-form";
import { getList } from "@/lib/data";

export default async function EditListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const found = getList(Number(id)); if (!found) notFound(); const list = found!;
  return <div className="mx-auto max-w-3xl"><div className="mb-6"><p className="text-sm font-bold text-teal-700">Configuração</p><h1 className="mt-1 text-3xl font-black">Editar lista</h1><p className="mt-2 text-sm text-slate-600">Altere datas, horários e observações.</p></div><ListForm initial={list} /></div>;
}
