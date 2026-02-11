import WaitlistForm from "@/components/waitlist-form";

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="font-medium text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="font-semibold tracking-tight text-slate-900">Tempo+</div>
          <nav className="hidden gap-6 text-sm text-slate-600 md:flex">
            <a href="#como-funciona" className="hover:text-slate-900">
              Como funciona
            </a>
            <a href="#recursos" className="hover:text-slate-900">
              Recursos
            </a>
            <a href="#para-quem" className="hover:text-slate-900">
              Para quem
            </a>
          </nav>
          <a
            href="#waitlist"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Entrar na lista
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-16">
        <div className="grid items-start gap-12 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Sua vida em ordem, sem complicar.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Calendário, tarefas, rotinas, pausas e reflexões diárias — numa
              interface minimalista, colaborativa e pronta para o dia a dia.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#waitlist"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
              >
                Pedir acesso ao beta
              </a>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-slate-900 hover:bg-slate-50"
              >
                Ver como funciona
              </a>
            </div>

            <ul className="mt-8 grid gap-2 text-sm text-slate-600">
              <li>• Simples como agenda de papel. Poderoso como app moderno.</li>
              <li>• Compartilhe espaços (família/equipe) com permissões.</li>
              <li>• Pausas e reflexão diária para manter intenção e presença.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-900">Prévia do Dashboard</div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-medium text-slate-900">Hoje</div>
                <div className="mt-2 h-2 w-2/3 rounded bg-slate-100" />
                <div className="mt-2 h-2 w-1/2 rounded bg-slate-100" />
                <div className="mt-2 h-2 w-3/5 rounded bg-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="text-sm font-medium text-slate-900">Timer</div>
                  <div className="mt-2 h-2 w-4/5 rounded bg-slate-100" />
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="text-sm font-medium text-slate-900">Reflexão</div>
                  <div className="mt-2 h-2 w-3/4 rounded bg-slate-100" />
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              (Mock) Layout final vai evoluir com o MVP.
            </p>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Como funciona
        </h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Um fluxo único para organizar o seu dia: planejar, executar, descansar.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Feature
            title="1) Planeje o dia"
            desc="Tarefas + calendário numa só visão (dia/semana/mês)."
          />
          <Feature
            title="2) Execute com foco"
            desc="Timer/Pomodoro e lembretes gentis para manter ritmo."
          />
          <Feature
            title="3) Feche com intenção"
            desc="Reflexão diária (versículo/prompt/meditação) no seu horário."
          />
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Recursos
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Feature
            title="Tarefas simples (lista + kanban)"
            desc="Sem curva de aprendizado. Prioridades, prazos e responsáveis."
          />
          <Feature
            title="Rotinas recorrentes"
            desc="Templates para rotina pessoal, família e trabalho."
          />
          <Feature
            title="Espaços compartilhados"
            desc="Família/equipe com permissões (owner/editor/viewer)."
          />
          <Feature
            title="PWA e offline básico"
            desc="Funciona no celular e desktop; sincroniza quando voltar."
          />
        </div>
        <p className="mt-6 text-sm text-slate-500">
          Finanças (contas/despesas) entra depois do MVP.
        </p>
      </section>

      {/* Para quem */}
      <section id="para-quem" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Para quem
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Feature
            title="Profissionais"
            desc="Centralize trabalho e pessoal sem virar um sistema complexo."
          />
          <Feature
            title="Famílias"
            desc="Rotinas, compromissos e tarefas compartilhadas com leveza."
          />
          <Feature
            title="Times pequenos"
            desc="Acompanhamento simples de entregas e agenda do time."
          />
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Entre na lista de espera
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Convite para o beta + novidades do lançamento. Poucas mensagens — só
            quando fizer sentido.
          </p>
          <div className="mt-8">
            <WaitlistForm />
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Sem spam. Cancelamento com 1 clique.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Tempo+</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-900">
              Privacidade
            </a>
            <a href="#" className="hover:text-slate-900">
              Termos
            </a>
            <a href="mailto:contato@tempoplus.app" className="hover:text-slate-900">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
