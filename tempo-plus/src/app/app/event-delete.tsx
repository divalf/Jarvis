"use client";

import { useTransition } from "react";
import { deleteEvent } from "@/app/app/actions";

export default function EventDelete({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="text-xs text-slate-500 hover:text-red-600 disabled:opacity-60"
      onClick={() => {
        startTransition(async () => {
          await deleteEvent(eventId);
        });
      }}
    >
      Remover
    </button>
  );
}
