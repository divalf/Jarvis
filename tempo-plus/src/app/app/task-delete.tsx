"use client";

import { useTransition } from "react";
import { deleteTask } from "@/app/app/task-actions";
import { useToast } from "@/components/toast";

export default function TaskDelete({ taskId }: { taskId: string }) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="text-xs text-slate-500 hover:text-red-700 disabled:opacity-60"
      onClick={() => {
        const ok = window.confirm("Excluir esta tarefa? Isso não pode ser desfeito.");
        if (!ok) return;

        startTransition(async () => {
          try {
            await deleteTask(taskId);
            toast.push({ message: "Tarefa excluída", variant: "success" });
          } catch (e) {
            const msg = e instanceof Error ? e.message : "Não consegui excluir a tarefa.";
            toast.push({ message: msg, variant: "error" });
          }
        });
      }}
    >
      Excluir
    </button>
  );
}
