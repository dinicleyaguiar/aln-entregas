"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Initial = {
  id?: number;
  title?: string;
  arrival_date?: string;
  return_date?: string;
  morning_open?: string;
  morning_close?: string;
  afternoon_open?: string;
  afternoon_close?: string;
  notes?: string | null;
  status?: string;
};

export function ListForm({ initial = {} }: { initial?: Initial }) {
  const router = useRouter();
  const editing = Boolean(initial.id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());

    try {
      const response = await fetch(
        editing ? `/api/admin/lists/${initial.id}` : "/api/admin/lists",
        {
          method: editing ? "PUT" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível salvar.");
      }

      router.push(`/admin/listas/${data.id || initial.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="title">
            Nome da lista
          </label>
          <input
            className="input"
            id="title"
            name="title"
            required
            defaultValue={initial.title || "Mercadorias"}
            placeholder="Ex.: Mercadorias 23/07"
          />
        </div>

        <Field
          label="Data de chegada"
          name="arrivalDate"
          type="date"
          required
          defaultValue={initial.arrival_date}
        />
        <Field
          label="Data de devolução"
          name="returnDate"
          type="date"
          required
          defaultValue={initial.return_date}
        />

        <TimeGroup title="Horário da manhã">
          <Field
            label="Abertura"
            name="morningOpen"
            type="time"
            required
            defaultValue={initial.morning_open || "09:00"}
          />
          <Field
            label="Fechamento"
            name="morningClose"
            type="time"
            required
            defaultValue={initial.morning_close || "12:00"}
          />
        </TimeGroup>

        <TimeGroup title="Horário da tarde">
          <Field
            label="Abertura"
            name="afternoonOpen"
            type="time"
            required
            defaultValue={initial.afternoon_open || "14:00"}
          />
          <Field
            label="Fechamento"
            name="afternoonClose"
            type="time"
            required
            defaultValue={initial.afternoon_close || "18:00"}
          />
        </TimeGroup>

        {editing && (
          <div className="sm:col-span-2">
            <label className="label" htmlFor="status">
              Situação da lista
            </label>
            <select
              className="input"
              id="status"
              name="status"
              defaultValue={initial.status || "ATIVA"}
            >
              <option value="ATIVA">Ativa</option>
              <option value="ARQUIVADA">Arquivada</option>
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="label" htmlFor="notes">
            Observações
          </label>
          <textarea
            className="input min-h-32 resize-y"
            id="notes"
            name="notes"
            defaultValue={initial.notes || ""}
            placeholder="Informações adicionais para o entregador"
          />
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:flex sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-secondary sm:min-w-32"
        >
          Cancelar
        </button>
        <button className="btn btn-primary sm:min-w-44" disabled={loading}>
          {loading ? "Salvando..." : editing ? "Salvar alterações" : "Criar lista"}
        </button>
      </div>
    </form>
  );
}

function TimeGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-[20px] border border-slate-200 bg-slate-50/70 p-4 sm:col-span-2">
      <legend className="px-1 text-sm font-extrabold text-slate-800">{title}</legend>
      <div className="mt-2 grid gap-4 min-[430px]:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field(props: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="min-w-0">
      <label className="label" htmlFor={props.name}>
        {props.label}
      </label>
      <input
        className="input"
        id={props.name}
        name={props.name}
        type={props.type}
        required={props.required}
        defaultValue={props.defaultValue}
      />
    </div>
  );
}
