import { ListForm } from "@/components/list-form";
import { todayISO } from "@/lib/date";

export default function NewListPage() {
  const today = todayISO();
  const date = new Date(`${today}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + 10);
  const returnDate = date.toISOString().slice(0,10);
  return <div className="mx-auto max-w-3xl"><div className="mb-6"><p className="text-sm font-bold text-teal-700">Cadastro</p><h1 className="mt-1 text-3xl font-black">Nova lista</h1><p className="mt-2 text-sm text-slate-600">Informe a chegada, o prazo e os horários. Os nomes serão adicionados depois.</p></div><ListForm initial={{ arrival_date: today, return_date: returnDate }} /></div>;
}
