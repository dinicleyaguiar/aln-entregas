"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";

const links = [
  { href: "/admin", label: "Início", icon: "⌂" },
  { href: "/admin/listas", label: "Listas", icon: "☷" },
  { href: "/admin/listas/nova", label: "Nova lista", icon: "+" },
];

export function AdminShell({
  adminName,
  children,
}: {
  adminName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-slate-200/80 bg-white p-5 lg:flex lg:flex-col">
        <Logo />
        <nav className="mt-8 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-h-13 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                active(link.href)
                  ? "bg-teal-700 text-white shadow-lg shadow-teal-900/10"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="grid w-6 place-items-center text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto rounded-[20px] border border-slate-100 bg-slate-50 p-4">
          <div className="text-xs text-slate-500">Conectado como</div>
          <div className="mt-1 truncate text-sm font-bold">{adminName}</div>
          <form method="post" action="/api/auth/logout">
            <button className="mt-3 min-h-8 text-xs font-bold text-red-700">
              Sair do painel
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 pb-24 lg:pb-0">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/92 backdrop-blur-2xl lg:hidden">
          <div className="container-app flex min-h-[72px] items-center justify-between gap-3">
            <Logo compact />
            <div className="min-w-0 text-right">
              <div className="max-w-48 truncate text-sm font-bold">{adminName}</div>
              <form method="post" action="/api/auth/logout">
                <button className="min-h-7 text-xs font-semibold text-red-700">Sair</button>
              </form>
            </div>
          </div>
        </header>

        <main className="container-app py-6 sm:py-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-slate-200 bg-white/96 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.05)] backdrop-blur-2xl lg:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex min-h-14 flex-col items-center justify-center rounded-2xl text-xs font-bold transition ${
              active(link.href) ? "bg-teal-50 text-teal-800" : "text-slate-500"
            }`}
          >
            <span className="text-xl leading-none">{link.icon}</span>
            <span className="mt-1">{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
