"use client";

import { useState, useTransition } from "react";
import { saveReflection } from "@/app/app/reflection-actions";

export default function ReflectionEditor({
  initialContent,
  dateLabel,
}: {
  initialContent: string;
  dateLabel: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">{dateLabel}</div>
        {status === "saved" ? (
          <div className="text-xs text-green-700">Salvo</div>
        ) : null}
        {status === "error" ? (
          <div className="text-xs text-red-700">Erro ao salvar</div>
        ) : null}
      </div>

      <textarea
        className="min-h-[120px] w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600"
        placeholder="Escreva uma reflexão (ou oração, ou 1 linha de gratidão)…"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setStatus("idle");
        }}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={isPending}
          onClick={() => {
            setStatus("idle");
            startTransition(async () => {
              try {
                await saveReflection(content);
                setStatus("saved");
              } catch {
                setStatus("error");
              }
            });
          }}
        >
          {isPending ? "Salvando…" : "Salvar"}
        </button>

        <button
          type="button"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          onClick={() => {
            setContent("");
            setStatus("idle");
          }}
        >
          Limpar
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Dica: mantenha curto. O objetivo é consistência, não perfeição.
      </p>
    </div>
  );
}
