"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Mode = "focus" | "break";

type Stored = {
  mode?: Mode;
  focusMin?: number;
  breakMin?: number;
  isRunning?: boolean;
  remainingSec?: number;
  updatedAt?: number;
};

function formatTime(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

const STORAGE_KEY = "tempo_plus_pomodoro_v1";

function loadStored(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Stored;
  } catch {
    return null;
  }
}

export default function Pomodoro() {
  const initial = useMemo(() => {
    if (typeof window === "undefined") {
      return { mode: "focus" as Mode, focusMin: 25, breakMin: 5, isRunning: false, remainingSec: 25 * 60 };
    }

    const s = loadStored();
    const mode: Mode = s?.mode ?? "focus";
    const focusMin = typeof s?.focusMin === "number" ? s!.focusMin! : 25;
    const breakMin = typeof s?.breakMin === "number" ? s!.breakMin! : 5;
    const isRunning = !!s?.isRunning;
    const remainingSec =
      typeof s?.remainingSec === "number"
        ? s!.remainingSec!
        : (mode === "focus" ? focusMin : breakMin) * 60;

    // Note: we intentionally do not compensate for time passed while the tab was closed,
    // to keep the component pure during render.

    return { mode, focusMin, breakMin, isRunning, remainingSec };
  }, []);

  const [mode, setMode] = useState<Mode>(initial.mode);
  const [focusMin, setFocusMin] = useState(initial.focusMin);
  const [breakMin, setBreakMin] = useState(initial.breakMin);
  const [isRunning, setIsRunning] = useState(initial.isRunning);
  const [remainingSec, setRemainingSec] = useState(initial.remainingSec);

  const modeRef = useRef(mode);
  const focusRef = useRef(focusMin);
  const breakRef = useRef(breakMin);

  useEffect(() => {
    modeRef.current = mode;
    focusRef.current = focusMin;
    breakRef.current = breakMin;
  }, [mode, focusMin, breakMin]);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          mode,
          focusMin,
          breakMin,
          isRunning,
          remainingSec,
          updatedAt: Date.now(),
        }),
      );
    } catch {
      // ignore
    }
  }, [mode, focusMin, breakMin, isRunning, remainingSec]);

  // Tick
  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          // Stop and flip
          const currentMode = modeRef.current;
          const nextMode: Mode = currentMode === "focus" ? "break" : "focus";
          setIsRunning(false);
          setMode(nextMode);

          // Best-effort: browser notification
          try {
            if ("Notification" in window) {
              if (Notification.permission === "default") {
                Notification.requestPermission();
              }
              if (Notification.permission === "granted") {
                new Notification(nextMode === "break" ? "Hora da pausa" : "Voltar ao foco", {
                  body:
                    nextMode === "break"
                      ? "Respira. Levanta. Água."
                      : "Vamos para mais um ciclo.",
                });
              }
            }
          } catch {
            // ignore
          }

          return (nextMode === "focus" ? focusRef.current : breakRef.current) * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning]);

  const totalSec = useMemo(
    () => (mode === "focus" ? focusMin : breakMin) * 60,
    [mode, focusMin, breakMin],
  );
  const progress = totalSec ? 1 - remainingSec / totalSec : 0;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-slate-900">
            {mode === "focus" ? "Foco" : "Pausa"}
          </div>
          <div className="text-2xl font-semibold tracking-tight text-slate-900">
            {formatTime(remainingSec)}
          </div>
        </div>
        <div className="text-xs text-slate-500">Pomodoro v1</div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded bg-slate-100">
        <div
          className="h-2 bg-blue-600"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={() => setIsRunning((v) => !v)}
        >
          {isRunning ? "Pausar" : "Iniciar"}
        </button>

        <button
          type="button"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          onClick={() => {
            setIsRunning(false);
            setRemainingSec(totalSec);
          }}
        >
          Resetar
        </button>

        <button
          type="button"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          onClick={() => {
            setIsRunning(false);
            const nextMode: Mode = mode === "focus" ? "break" : "focus";
            setMode(nextMode);
            setRemainingSec((nextMode === "focus" ? focusMin : breakMin) * 60);
          }}
        >
          Alternar
        </button>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-xs font-medium text-slate-600">Foco (min)</span>
          <input
            type="number"
            min={5}
            max={90}
            value={focusMin}
            onChange={(e) => {
              const v = Math.max(5, Math.min(90, Number(e.target.value) || 25));
              setFocusMin(v);
              if (mode === "focus" && !isRunning) setRemainingSec(v * 60);
            }}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-blue-600"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-medium text-slate-600">Pausa (min)</span>
          <input
            type="number"
            min={1}
            max={30}
            value={breakMin}
            onChange={(e) => {
              const v = Math.max(1, Math.min(30, Number(e.target.value) || 5));
              setBreakMin(v);
              if (mode === "break" && !isRunning) setRemainingSec(v * 60);
            }}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-blue-600"
          />
        </label>
      </div>

      <p className="text-xs text-slate-500">
        Dica: mantenha o túnel aberto; o timer roda no seu navegador.
      </p>
    </div>
  );
}
