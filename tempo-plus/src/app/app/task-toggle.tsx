"use client";

import { useTransition } from "react";
import { toggleTaskDone } from "@/app/app/actions";

export default function TaskToggle({
  taskId,
  checked,
}: {
  taskId: string;
  checked: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <input
      aria-label={checked ? "Marcar como não concluída" : "Marcar como concluída"}
      type="checkbox"
      checked={checked}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.checked;
        startTransition(async () => {
          await toggleTaskDone(taskId, next);
        });
      }}
      className="h-4 w-4 accent-blue-600"
    />
  );
}
