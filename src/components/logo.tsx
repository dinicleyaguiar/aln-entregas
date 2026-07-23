export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-700 text-xl font-black text-white shadow-lg shadow-teal-900/15">A</div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-lg font-extrabold tracking-tight">ALN Entregas</div>
          <div className="text-xs text-slate-500">Encomendas organizadas</div>
        </div>
      )}
    </div>
  );
}
