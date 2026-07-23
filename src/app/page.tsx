import Link from "next/link";
import { Logo } from "@/components/logo";
import { PublicSearch } from "@/components/public-search";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const whatsappNumber = process.env.WHATSAPP_NUMBER || "5594999999999";

  return (
    <main className="min-h-screen pb-10">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/82 backdrop-blur-2xl">
        <div className="container-app flex min-h-[76px] items-center justify-between gap-3">
          <Logo />
          <Link
            href="/admin/login"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3.5 text-[13px] font-bold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Área do entregador
          </Link>
        </div>
      </header>

      <section className="container-app py-8 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="mb-7 text-center sm:mb-9">
            <span className="badge border border-teal-100 bg-teal-50 text-teal-800">
              Consulta rápida de encomendas
            </span>
            <h1 className="mx-auto mt-4 max-w-2xl text-[2rem] font-black leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
              Veja se sua encomenda já chegou
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-6 text-slate-600 sm:text-lg sm:leading-7">
              Digite seu nome para conferir a disponibilidade, os dias restantes para retirada e os horários de atendimento.
            </p>
          </div>

          <PublicSearch whatsappNumber={whatsappNumber} />
        </div>
      </section>

      <footer className="container-app safe-bottom text-center text-xs leading-5 text-slate-500">
        ALN Entregas · Consulta simples e segura
      </footer>
    </main>
  );
}
