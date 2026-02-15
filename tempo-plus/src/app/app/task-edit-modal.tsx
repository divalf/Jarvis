"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { updateTask } from "@/app/app/task-actions";

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

export default function TaskEditModal({ task }: { task: TaskLike }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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
                disabled={isPending}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                onClick={() => {
                  startTransition(async () => {
                    await updateTask({
                      id: task.id,
                      title,
                      notes,
                      dueAt: dueAt || null,
                      estimateMin: estimateMin ? Number(estimateMin) : null,
                    });
                    setOpen(false);
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
