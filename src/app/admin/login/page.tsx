import Link from "next/link";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type LoginPageProps = {
  searchParams: Promise<{ erro?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = Array.isArray(params.erro) ? params.erro[0] : params.erro;

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        <section className="card p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black">Painel do entregador</h1>
            <p className="mt-2 text-sm text-slate-600">
              Entre para cadastrar listas e confirmar retiradas.
            </p>
          </div>

          <LoginForm error={error} />

          <div className="mt-5 text-center">
            <Link href="/" className="text-sm font-semibold text-teal-700">
              ← Voltar para consulta
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
