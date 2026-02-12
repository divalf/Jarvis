import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensurePersonalSpace } from "@/lib/app-data";
import { createEvent, createTask } from "@/app/app/actions";
import EventDelete from "@/app/app/event-delete";
import TaskToggle from "@/app/app/task-toggle";
import Pomodoro from "@/app/app/pomodoro";
import ReflectionEditor from "@/app/app/reflection-editor";

export default async function AppHome() {
  const session = await auth();
  if (!session?.user?.email) redirect("/signin");

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) {
    // In case NextAuth created a session but user row isn't ready.
    redirect("/signin");
  }

  const space = await ensurePersonalSpace(dbUser.id);

  const tasks = await prisma.task.findMany({
    where: { spaceId: space.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 50,
  });

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const events = await prisma.calendarEvent.findMany({
    where: {
      spaceId: space.id,
      startAt: { lte: endOfDay },
      endAt: { gte: startOfDay },
    },
    orderBy: [{ startAt: "asc" }],
    take: 20,
  });

  const dateUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const reflection = await prisma.reflectionEntry.findUnique({
    where: { userId_date: { userId: dbUser.id, date: dateUTC } },
  });

  const todo = tasks.filter((t) => t.status !== "DONE");
  const done = tasks.filter((t) => t.status === "DONE");

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Hoje
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Espaço: <span className="font-medium">{space.name}</span>
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-slate-900">Tarefas</h2>
          <span className="text-xs text-slate-500">MVP • lista</span>
        </div>

        <form action={createTask} className="mt-4 flex gap-2">
          <input
            name="title"
            className="h-11 flex-1 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-blue-600"
            placeholder="Adicionar tarefa…"
          />
          <button className="h-11 rounded-md bg-blue-600 px-4 font-medium text-white hover:bg-blue-700">
            Criar
          </button>
        </form>

        <div className="mt-6 grid gap-2">
          {todo.length === 0 ? (
            <p className="text-sm text-slate-600">Sem tarefas por aqui. 👌</p>
          ) : (
            todo.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2"
              >
                <TaskToggle taskId={t.id} checked={t.status === "DONE"} />
                <div className="flex-1 text-sm text-slate-900">{t.title}</div>
              </div>
            ))
          )}
        </div>

        {done.length ? (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-slate-600">
              Concluídas ({done.length})
            </summary>
            <div className="mt-3 grid gap-2">
              {done.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2"
                >
                  <TaskToggle taskId={t.id} checked={true} />
                  <div className="flex-1 text-sm text-slate-500 line-through">
                    {t.title}
                  </div>
                </div>
              ))}
            </div>
          </details>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-slate-900">Agenda (hoje)</h2>
          <span className="text-xs text-slate-500">MVP • eventos internos</span>
        </div>

        <form action={createEvent} className="mt-4 grid gap-2 md:grid-cols-4">
          <input
            name="title"
            className="h-11 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-blue-600 md:col-span-2"
            placeholder="Novo evento…"
          />
          <input
            name="startAt"
            type="datetime-local"
            className="h-11 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-blue-600"
          />
          <input
            name="endAt"
            type="datetime-local"
            className="h-11 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-blue-600"
          />
          <button className="h-11 rounded-md bg-blue-600 px-4 font-medium text-white hover:bg-blue-700 md:col-span-4 md:justify-self-end">
            Criar evento
          </button>
        </form>

        <div className="mt-6 grid gap-2">
          {events.length === 0 ? (
            <p className="text-sm text-slate-600">Sem eventos hoje.</p>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {ev.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {ev.startAt.toLocaleString()} → {ev.endAt.toLocaleString()}
                  </div>
                </div>
                <EventDelete eventId={ev.id} />
              </div>
            ))
          )}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Timer & Pausas</h2>
          <div className="mt-4">
            <Pomodoro />
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Reflexão</h2>
          <div className="mt-4">
            <ReflectionEditor initialContent={reflection?.content ?? ""} dateLabel={"Hoje"} />
          </div>
        </section>
      </div>
    </div>
  );
}
