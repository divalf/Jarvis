"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { updateTask } from "@/app/app/task-actions";
import { useToast } from "@/components/toast";

type TaskLike = {
  id: string;
  title: string;
  notes: string | null;
  dueAt: string | null; // ISO
  estimateMin: number | null;
};

function toDatetimeLocal(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  // Convert to local datetime-local format: YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function getErrorMessage(e: unknown) {
  const msg = e instanceof Error ? e.message : "";
  if (msg.includes("UNAUTHENTICATED")) return "Sua sessão expirou. Faça login novamente.";
  if (msg.includes("FORBIDDEN")) return "Você não tem permissão para editar esta tarefa.";
  if (msg.includes("INVALID_DUE_AT")) return "Prazo inválido. Confira o campo.";
  return "Não consegui salvar. Confira os campos.";
}

export default function TaskEditModal({ task }: { task: TaskLike }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const initial = useMemo(
    () => ({
      title: task.title,
      notes: task.notes ?? "",
      dueAt: toDatetimeLocal(task.dueAt),
      estimateMin: task.estimateMin?.toString() ?? "",
    }),
    [task],
  );

  const [title, setTitle] = useState(initial.title);
  const [notes, setNotes] = useState(initial.notes);
  const [dueAt, setDueAt] = useState(initial.dueAt);
  const [estimateMin, setEstimateMin] = useState(initial.estimateMin);

  const trimmedTitle = title.trim();
  const estimateVal = estimateMin.trim().length ? Number(estimateMin) : null;
  const estimateInvalid = estimateVal !== null && (!Number.isFinite(estimateVal) || estimateVal < 0);

  // Avoid setState-in-effect: reset on open.
  useEffect(() => {
    if (!open) return;
    // no-op; state is reset in onClick before opening
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="text-xs text-slate-500 hover:text-slate-900"
        onClick={() => {
          setTitle(initial.title);
          setNotes(initial.notes);
          setDueAt(initial.dueAt);
          setEstimateMin(initial.estimateMin);
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
          aria-label="Editar tarefa"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold text-slate-900">Editar tarefa</h3>
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

              <label className="grid gap-1">
                <span className="text-xs font-medium text-slate-600">Notas</span>
                <textarea
                  className="min-h-[90px] w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-medium text-slate-600">Prazo</span>
                  <input
                    type="datetime-local"
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-blue-600"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                  />
                  <button
                    type="button"
                    className="w-fit text-xs text-slate-500 hover:text-slate-900"
                    onClick={() => setDueAt("")}
                  >
                    Limpar prazo
                  </button>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium text-slate-600">Estimativa (min)</span>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-blue-600"
                    value={estimateMin}
                    onChange={(e) => setEstimateMin(e.target.value)}
                    placeholder="ex: 30"
                  />
                </label>
              </div>

              {estimateInvalid ? (
                <p className="text-sm text-red-600">A estimativa precisa ser um número ≥ 0.</p>
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
                disabled={isPending || trimmedTitle.length === 0 || estimateInvalid}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                onClick={() => {
                  if (trimmedTitle.length === 0) {
                    setError("O título é obrigatório.");
                    return;
                  }
                  if (estimateInvalid) {
                    setError("A estimativa precisa ser um número ≥ 0.");
                    return;
                  }
                  setError(null);
                  setSuccess(null);
                  startTransition(async () => {
                    try {
                      await updateTask({
                        id: task.id,
                        title: trimmedTitle,
                        notes,
                        dueAt: dueAt || null,
                        estimateMin: estimateVal,
                      });
                      setSuccess("Salvo.");
                      toast.push({ message: "Tarefa atualizada", variant: "success" });
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
