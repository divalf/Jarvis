"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("organização");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );

  return (
    <form
      className="grid gap-3 md:grid-cols-[1.6fr_1fr_auto]"
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("loading");
        try {
          const res = await fetch("/api/waitlist", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, goal }),
          });
          if (!res.ok) throw new Error("request_failed");
          setStatus("ok");
          window.location.href = "/thank-you";
        } catch {
          setStatus("error");
        }
      }}
    >
      <label className="grid gap-1">
        <span className="text-sm font-medium text-slate-900">Email</span>
        <input
          className="h-11 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-blue-600"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium text-slate-900">Objetivo</span>
        <select
          className="h-11 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-blue-600"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        >
          <option value="organização">Organização</option>
          <option value="foco">Foco</option>
          <option value="descanso">Descanso</option>
          <option value="espiritualidade">Espiritualidade</option>
        </select>
      </label>

      <button
        className="mt-6 h-11 rounded-md bg-blue-600 px-5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        type="submit"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Enviando…" : "Quero meu convite"}
      </button>

      {status === "error" ? (
        <p className="text-sm text-red-600 md:col-span-3">
          Não consegui cadastrar agora. Tenta de novo em instantes.
        </p>
      ) : null}
    </form>
  );
}
