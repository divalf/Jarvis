"use client";

import { useMemo, useState, useTransition } from "react";
import { updateEvent } from "@/app/app/event-actions";
import { useToast } from "@/components/toast";

function getErrorMessage(e: unknown) {
  const msg = e instanceof Error ? e.message : "";
  if (msg.includes("UNAUTHENTICATED")) return "Sua sessão expirou. Faça login novamente.";
  if (msg.includes("FORBIDDEN")) return "Você não tem permissão para editar este evento.";
  if (msg.includes("END_BEFORE_START")) return "O horário de fim precisa ser depois do início.";
  if (msg.includes("INVALID_DATE")) return "Data/hora inválida. Confira os campos.";
  return "Não consegui salvar. Confira título e horários.";
}

type EventLike = {
  id: string;
  title: string;
  startAt: string; // ISO
  endAt: string; // ISO
};

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function EventEditModal({ ev }: { ev: EventLike }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const initial = useMemo(
    () => ({
      title: ev.title,
      startAt: toDatetimeLocal(ev.startAt),
      endAt: toDatetimeLocal(ev.endAt),
    }),
    [ev],
  );

  const [title, setTitle] = useState(initial.title);
  const [startAt, setStartAt] = useState(initial.startAt);
  const [endAt, setEndAt] = useState(initial.endAt);

  const trimmedTitle = title.trim();
  const startMs = startAt ? new Date(startAt).getTime() : NaN;
  const endMs = endAt ? new Date(endAt).getTime() : NaN;
  const hasRangeError =
    Number.isFinite(startMs) && Number.isFinite(endMs) ? endMs <= startMs : false;

  return (
    <>
      <button
        type="button"
        className="text-xs text-slate-500 hover:text-slate-900"
        onClick={() => {
          setTitle(initial.title);
          setStartAt(initial.startAt);
          setEndAt(initial.endAt);
          setError(null);
          setSuccess(null);
          setOpen(true);
        }}
      >
        Editar
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Editar evento"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold text-slate-900">Editar evento</h3>
              <button
                type="button"
                className="text-sm text-slate-500 hover:text-slate-900"
                onClick={() => setOpen(false)}
              >
                Fechar
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-medium text-slate-600">Título</span>
                <input
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-blue-600"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-medium text-slate-600">Início</span>
                  <input
                    type="datetime-local"
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-blue-600"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-medium text-slate-600">Fim</span>
                  <input
                    type="datetime-local"
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-blue-600"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                  />
                </label>
              </div>

              {hasRangeError ? (
                <p className="text-sm text-red-600">
                  O horário de fim precisa ser depois do início.
                </p>
              ) : null}
              {success ? (
                <p className="text-sm text-emerald-700">{success}</p>
              ) : null}
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending || trimmedTitle.length === 0 || hasRangeError}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                onClick={() => {
                  if (trimmedTitle.length === 0) {
                    setError("O título é obrigatório.");
                    return;
                  }
                  if (hasRangeError) {
                    setError("O horário de fim precisa ser depois do início.");
                    return;
                  }
                  setError(null);
                  setSuccess(null);
                  startTransition(async () => {
                    try {
                      await updateEvent({
                        id: ev.id,
                        title: trimmedTitle,
                        startAt: startAt || "",
                        endAt: endAt || "",
                      });
                      setSuccess("Salvo.");
                      toast.push({ message: "Evento atualizado", variant: "success" });
                      window.setTimeout(() => setOpen(false), 350);
                    } catch (e) {
                      const msg = getErrorMessage(e);
                      setError(msg);
                      toast.push({ message: msg, variant: "error" });
                    }
                  });
                }}
              >
                {isPending ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
