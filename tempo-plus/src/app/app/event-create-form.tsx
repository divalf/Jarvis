"use client";

import { useRef, useState, useTransition } from "react";
import { createEvent } from "@/app/app/actions";
import { useToast } from "@/components/toast";

function getErrorMessage(e: unknown) {
  const msg = e instanceof Error ? e.message : "";
  if (msg.includes("TITLE_REQUIRED")) return "O título é obrigatório.";
  if (msg.includes("DATES_REQUIRED")) return "Preencha início e fim.";
  if (msg.includes("INVALID_DATE")) return "Data/hora inválida. Confira os campos.";
  if (msg.includes("END_BEFORE_START")) return "O horário de fim precisa ser depois do início.";
  if (msg.includes("UNAUTHENTICATED")) return "Sua sessão expirou. Faça login novamente.";
  return "Não consegui criar o evento. Tente novamente.";
}

export default function EventCreateForm() {
  const toast = useToast();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      ref={formRef}
      className="mt-4 grid gap-2 md:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            await createEvent(fd);
            formRef.current?.reset();
            toast.push({ message: "Evento criado", variant: "success" });
          } catch (err) {
            const msg = getErrorMessage(err);
            setError(msg);
            toast.push({ message: msg, variant: "error" });
          }
        });
      }}
    >
      <input
        name="title"
        className="h-11 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-blue-600 md:col-span-2"
        placeholder="Novo evento…"
        disabled={isPending}
      />
      <input
        name="startAt"
        type="datetime-local"
        className="h-11 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-blue-600"
        disabled={isPending}
      />
      <input
        name="endAt"
        type="datetime-local"
        className="h-11 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-blue-600"
        disabled={isPending}
      />

      <div className="md:col-span-4 md:flex md:items-center md:justify-between">
        <div>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </div>
        <button
          disabled={isPending}
          className="mt-2 h-11 w-full rounded-md bg-blue-600 px-4 font-medium text-white hover:bg-blue-700 disabled:opacity-60 md:mt-0 md:w-auto"
        >
          {isPending ? "Criando…" : "Criar evento"}
        </button>
      </div>
    </form>
  );
}
