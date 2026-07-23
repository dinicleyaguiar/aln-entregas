"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseNames } from "@/lib/text";

type Recipient = {
  id: number;
  name: string;
  phone: string | null;
  status: string;
  received_at: string | null;
};

export function ListManager({
  listId,
  initialRecipients,
}: {
  listId: number;
  initialRecipients: Recipient[];
}) {
  const router = useRouter();
  const [recipients, setRecipients] = useState(initialRecipients);
  const [namesText, setNamesText] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("TODOS");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<Recipient | null>(null);
  const parsedCount = parseNames(namesText).length;

  const visible = useMemo(
    () =>
      recipients.filter((item) => {
        const matchesQuery = item.name
          .toLocaleLowerCase("pt-BR")
          .includes(query.toLocaleLowerCase("pt-BR"));
        const matchesFilter = filter === "TODOS" || item.status === filter;
        return matchesQuery && matchesFilter;
      }),
    [recipients, query, filter],
  );

  async function importNames(event: FormEvent) {
    event.preventDefault();
    if (!parsedCount) return;

    setLoading(true);
    setNotice("");

    const response = await fetch(`/api/admin/lists/${listId}/recipients`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: namesText }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setNotice(data.error || "Erro ao adicionar nomes.");
      return;
    }

    setNamesText("");
    setNotice(
      `${data.inserted} nome${data.inserted === 1 ? "" : "s"} adicionado${data.inserted === 1 ? "" : "s"}. ${
        data.skipped ? `${data.skipped} repetido(s) ignorado(s).` : ""
      }`,
    );
    await reload();
    router.refresh();
  }

  async function reload() {
    const response = await fetch(`/api/admin/lists/${listId}/recipients`, {
      cache: "no-store",
    });
    const data = await response.json();
    if (response.ok) setRecipients(data.recipients);
  }

  async function toggle(item: Recipient) {
    const response = await fetch(`/api/admin/recipients/${item.id}/toggle`, {
      method: "POST",
    });
    if (response.ok) {
      await reload();
      router.refresh();
    }
  }

  async function remove(item: Recipient) {
    if (!confirm(`Excluir ${item.name} desta lista?`)) return;

    const response = await fetch(`/api/admin/recipients/${item.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setRecipients((current) => current.filter((row) => row.id !== item.id));
      router.refresh();
    }
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/recipients/${editing.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: form.get("name"), phone: form.get("phone") }),
    });
    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Não foi possível editar.");
      return;
    }

    setEditing(null);
    await reload();
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={importNames} className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Adicionar nomes</h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Cole um nome por linha. Também aceitamos vírgula ou ponto e vírgula.
            </p>
          </div>
          <span className="badge bg-teal-50 text-teal-700">
            {parsedCount} nome{parsedCount === 1 ? "" : "s"}
          </span>
        </div>

        <textarea
          className="input mt-4 min-h-44 resize-y"
          value={namesText}
          onChange={(event) => setNamesText(event.target.value)}
          placeholder={"Ana Maria\nCarlos Silva\nJoão Souza"}
        />

        <div className="mt-4 grid gap-3 sm:flex sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            Nomes repetidos são ignorados e a ordem alfabética é automática.
          </p>
          <button
            className="btn btn-primary w-full sm:w-auto sm:min-w-44"
            disabled={loading || !parsedCount}
          >
            {loading ? "Adicionando..." : "Adicionar à lista"}
          </button>
        </div>

        {notice && (
          <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm font-semibold text-teal-800">
            {notice}
          </div>
        )}
      </form>

      <section className="card p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_210px]">
          <div>
            <label className="label" htmlFor="recipient-search">
              Pesquisar recebedor
            </label>
            <div className="public-search-field min-w-0">
              <span className="public-search-icon" aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                id="recipient-search"
                className="input public-search-input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Digite um nome"
                inputMode="search"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="recipient-filter">
              Situação
            </label>
            <select
              id="recipient-filter"
              className="input"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="TODOS">Todos os nomes</option>
              <option value="AGUARDANDO">Aguardando</option>
              <option value="RECEBIDO">Recebidos</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 text-sm">
          <span className="font-extrabold text-slate-800">
            {visible.length} resultado{visible.length === 1 ? "" : "s"}
          </span>
          <span className="text-slate-500">Total da lista: {recipients.length}</span>
        </div>

        <div className="mt-4 space-y-3">
          {visible.map((item) => (
            <article
              key={item.id}
              className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <h3 className="break-words text-base font-extrabold leading-5 text-slate-950">
                    {item.name}
                  </h3>
                  {item.phone && (
                    <p className="mt-1.5 text-sm text-slate-500">{item.phone}</p>
                  )}
                  <span
                    className={`badge mt-3 ${
                      item.status === "RECEBIDO"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.status === "RECEBIDO" ? "Recebido" : "Aguardando retirada"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:justify-end">
                  <button
                    type="button"
                    onClick={() => toggle(item)}
                    className={`btn col-span-2 px-3 text-sm sm:col-auto ${
                      item.status === "RECEBIDO" ? "btn-secondary" : "btn-primary"
                    }`}
                  >
                    {item.status === "RECEBIDO" ? "Desfazer recebimento" : "Confirmar entrega"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    className="btn btn-secondary px-3 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    className="btn btn-danger px-3 text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </article>
          ))}

          {visible.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              Nenhum nome encontrado.
            </div>
          )}
        </div>
      </section>

      {editing && (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-slate-950/45 p-3 backdrop-blur-sm sm:place-items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setEditing(null);
          }}
        >
          <form
            onSubmit={saveEdit}
            className="card safe-bottom max-h-[92vh] w-full max-w-md overflow-y-auto rounded-b-none p-5 sm:rounded-[24px] sm:p-6"
          >
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden" />
            <h2 className="text-xl font-black">Editar recebedor</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="label" htmlFor="edit-name">
                  Nome completo
                </label>
                <input
                  id="edit-name"
                  className="input"
                  name="name"
                  defaultValue={editing.name}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="edit-phone">
                  Telefone opcional
                </label>
                <input
                  id="edit-phone"
                  className="input"
                  name="phone"
                  defaultValue={editing.phone || ""}
                  placeholder="(94) 99999-9999"
                  inputMode="tel"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
