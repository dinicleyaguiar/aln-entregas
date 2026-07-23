"use client";

import { FormEvent, useMemo, useState } from "react";

type Result = {
  id: number;
  name: string;
  status: string;
  receivedAt: string | null;
  listTitle: string;
  arrivalDate: string;
  returnDate: string;
  morningOpen: string;
  morningClose: string;
  afternoonOpen: string;
  afternoonClose: string;
  daysRemaining: number;
  deadlineLabel: string;
  arrivalDateFormatted: string;
  returnDateFormatted: string;
};

type Candidate = {
  key: string;
  name: string;
  packageCount: number;
};

function normalizeForCompare(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function groupCandidates(results: Result[]) {
  const grouped = new Map<string, Candidate>();

  for (const result of results) {
    const key = normalizeForCompare(result.name);
    const current = grouped.get(key);

    if (current) {
      current.packageCount += 1;
    } else {
      grouped.set(key, {
        key,
        name: result.name,
        packageCount: 1,
      });
    }
  }

  return [...grouped.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
  );
}

export function PublicSearch({ whatsappNumber }: { whatsappNumber: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [selectedName, setSelectedName] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const candidates = useMemo(() => groupCandidates(results), [results]);

  const visibleResults = useMemo(() => {
    if (!selectedName) return [];

    return results.filter(
      (result) => normalizeForCompare(result.name) === selectedName,
    );
  }, [results, selectedName]);

  async function search(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSearched(false);
    setSelectedName("");

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setError("Digite pelo menos duas letras do nome.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/public/search?q=${encodeURIComponent(trimmedQuery)}`,
        { cache: "no-store" },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível pesquisar.");
      }

      const foundResults = (data.results || []) as Result[];
      const foundCandidates = groupCandidates(foundResults);
      const normalizedQuery = normalizeForCompare(trimmedQuery);
      const exactCandidate = foundCandidates.find(
        (candidate) => candidate.key === normalizedQuery,
      );

      setResults(foundResults);
      setSearched(true);

      if (exactCandidate) {
        setSelectedName(exactCandidate.key);
      } else if (foundCandidates.length === 1) {
        setSelectedName(foundCandidates[0].key);
      }
    } catch (err) {
      setResults([]);
      setError(
        err instanceof Error ? err.message : "Não foi possível pesquisar.",
      );
    } finally {
      setLoading(false);
    }
  }

  function chooseCandidate(candidate: Candidate) {
    setSelectedName(candidate.key);

    window.setTimeout(() => {
      document
        .getElementById("search-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  const whatsappHref = useMemo(() => {
    const selectedCandidate = candidates.find(
      (candidate) => candidate.key === selectedName,
    );
    const personName = selectedCandidate?.name || query || "________";
    const text =
      message.trim() ||
      `Olá! Meu nome é ${personName}. Gostaria de informações sobre minha encomenda.`;

    return `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  }, [candidates, message, query, selectedName, whatsappNumber]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <form onSubmit={search} className="card p-5 sm:p-7">
        <div className="mb-4">
          <label htmlFor="name" className="label text-base">
            Digite seu nome
          </label>
          <p className="text-sm leading-5 text-slate-500">
            Pode informar apenas o primeiro nome para localizar as opções.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
          <div className="public-search-field min-w-0">
            <span className="public-search-icon" aria-hidden="true">
              <SearchIcon />
            </span>
            <input
              id="name"
              className="input public-search-input !min-h-[60px] text-[17px]"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setError("");
                setSearched(false);
                setSelectedName("");
              }}
              placeholder="Ex.: Maria"
              autoComplete="name"
              enterKeyHint="search"
            />
          </div>
          <button
            className="btn btn-primary !min-h-[60px] w-full"
            disabled={loading}
          >
            {loading ? "Pesquisando..." : "Buscar"}
          </button>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          A pesquisa aceita nomes incompletos e ignora acentos, letras maiúsculas
          e minúsculas.
        </p>

        {error && (
          <div
            className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}
      </form>

      {searched && results.length === 0 && (
        <div className="card p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-[22px] bg-amber-50 text-amber-700">
            <SearchIcon size={28} />
          </div>
          <h2 className="text-xl font-extrabold">
            Nenhuma encomenda encontrada
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Confira o nome digitado ou tente pesquisar somente pelo primeiro
            nome. Caso tenha dúvidas, fale com o entregador pelo WhatsApp.
          </p>
        </div>
      )}

      {searched && candidates.length > 1 && !selectedName && (
        <section className="card overflow-hidden">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal-700">
              Selecione seu nome
            </div>
            <h2 className="mt-2 text-xl font-black text-slate-950">
              Encontramos {candidates.length} opções
            </h2>
            <p className="mt-1.5 text-sm leading-5 text-slate-600">
              Toque em “Verificar” ao lado do seu nome para visualizar a
              encomenda.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {candidates.map((candidate) => (
              <div
                key={candidate.key}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0">
                  <div className="break-words text-base font-extrabold text-slate-950">
                    {candidate.name}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">
                    {candidate.packageCount === 1
                      ? "1 encomenda cadastrada"
                      : `${candidate.packageCount} encomendas cadastradas`}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary min-h-12 w-full shrink-0 sm:w-auto"
                  onClick={() => chooseCandidate(candidate)}
                >
                  Verificar
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {selectedName && candidates.length > 1 && (
        <div className="flex justify-end">
          <button
            type="button"
            className="btn btn-secondary min-h-11"
            onClick={() => setSelectedName("")}
          >
            Escolher outro nome
          </button>
        </div>
      )}

      <div id="search-results" className="scroll-mt-24 space-y-5">
        {visibleResults.map((result) => {
          const received = result.status === "RECEBIDO";
          const overdue = result.daysRemaining < 0 && !received;
          const urgent = result.daysRemaining <= 2 && !received && !overdue;
          const tone = received
            ? "emerald"
            : overdue
              ? "red"
              : urgent
                ? "amber"
                : "teal";

          return (
            <article key={result.id} className="card overflow-hidden">
              <div
                className={`h-1.5 ${
                  tone === "emerald"
                    ? "bg-emerald-500"
                    : tone === "red"
                      ? "bg-red-500"
                      : tone === "amber"
                        ? "bg-amber-500"
                        : "bg-teal-600"
                }`}
              />

              <div className="p-5 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal-700">
                      Encomenda encontrada
                    </div>
                    <h2 className="mt-2 break-words text-2xl font-black leading-tight text-slate-950">
                      {result.name}
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-500">
                      {result.listTitle}
                    </p>
                  </div>

                  <span
                    className={`badge self-start ${
                      tone === "emerald"
                        ? "bg-emerald-50 text-emerald-700"
                        : tone === "red"
                          ? "bg-red-50 text-red-700"
                          : tone === "amber"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-teal-50 text-teal-700"
                    }`}
                  >
                    {received ? "Encomenda recebida" : result.deadlineLabel}
                  </span>
                </div>

                {!received && (
                  <div
                    className={`mt-5 rounded-[20px] border p-4 sm:p-5 ${
                      overdue
                        ? "border-red-100 bg-red-50"
                        : urgent
                          ? "border-amber-100 bg-amber-50"
                          : "border-teal-100 bg-teal-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl font-black ${
                          overdue
                            ? "bg-red-100 text-red-800"
                            : urgent
                              ? "bg-amber-100 text-amber-800"
                              : "bg-teal-100 text-teal-800"
                        }`}
                      >
                        {overdue ? "!" : result.daysRemaining}
                      </div>
                      <div>
                        <div
                          className={`font-extrabold ${
                            overdue
                              ? "text-red-900"
                              : urgent
                                ? "text-amber-900"
                                : "text-teal-900"
                          }`}
                        >
                          {overdue
                            ? "Prazo informado encerrado"
                            : result.daysRemaining === 0
                              ? "Último dia para retirada"
                              : `${result.daysRemaining} dia${result.daysRemaining === 1 ? "" : "s"} restante${result.daysRemaining === 1 ? "" : "s"}`}
                        </div>
                        <p
                          className={`mt-1 text-sm leading-5 ${
                            overdue
                              ? "text-red-800"
                              : urgent
                                ? "text-amber-800"
                                : "text-teal-800"
                          }`}
                        >
                          {overdue
                            ? "Fale com o entregador para confirmar se o pacote ainda está disponível."
                            : "Retire sua encomenda antes da data de devolução informada."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {received && (
                  <div className="mt-5 rounded-[20px] border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-800">
                    Esta encomenda já foi marcada como recebida pelo entregador.
                  </div>
                )}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Info
                    icon={<CalendarIcon />}
                    label="Chegada"
                    value={result.arrivalDateFormatted}
                  />
                  <Info
                    icon={<ReturnIcon />}
                    label="Devolução prevista"
                    value={result.returnDateFormatted}
                  />
                </div>

                <div className="mt-3 rounded-[20px] border border-slate-100 bg-slate-50 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                    <ClockIcon />
                    Horários de atendimento
                  </div>
                  <div className="mt-3 grid gap-2 min-[430px]:grid-cols-2">
                    <Schedule
                      label="Manhã"
                      value={`${result.morningOpen} às ${result.morningClose}`}
                    />
                    <Schedule
                      label="Tarde"
                      value={`${result.afternoonOpen} às ${result.afternoonClose}`}
                    />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section className="card p-5 sm:p-7">
        <div className="flex items-start gap-3.5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <ChatIcon />
          </div>
          <div>
            <h2 className="text-lg font-extrabold">Falar com o entregador</h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Escreva sua dúvida e abra a conversa diretamente no WhatsApp.
            </p>
          </div>
        </div>

        <label htmlFor="message" className="label mt-5">
          Sua mensagem
        </label>
        <textarea
          id="message"
          className="input min-h-32 resize-y"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Olá! Gostaria de informações sobre minha encomenda."
        />
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary mt-3 w-full"
        >
          Abrir conversa no WhatsApp
        </a>
      </section>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.06em] text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-base font-extrabold text-slate-900">
        {value}
      </div>
    </div>
  );
}

function Schedule({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-extrabold text-slate-900">{value}</span>
    </div>
  );
}

function SearchIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m20 20-4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 3v4M16 3v4M3 10h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 7H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3h-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m8 4 4-3 4 3M12 1v11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 11.5a8 8 0 0 1-8.5 8A9 9 0 0 1 8 18.8L4 20l1.2-3.6A8 8 0 1 1 20 11.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
