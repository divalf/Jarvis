import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AppHome() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard (MVP)</h1>
      <p className="mt-2 text-slate-600">
        Bem-vindo, {session.user.name ?? session.user.email}.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-medium">Hoje</h2>
          <p className="mt-1 text-sm text-slate-600">Tarefas e compromissos do dia.</p>
        </section>
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-medium">Timer & Pausas</h2>
          <p className="mt-1 text-sm text-slate-600">Pomodoro simples (em breve).</p>
        </section>
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-medium">Reflexão</h2>
          <p className="mt-1 text-sm text-slate-600">Um prompt por dia (em breve).</p>
        </section>
      </div>
    </main>
  );
}
