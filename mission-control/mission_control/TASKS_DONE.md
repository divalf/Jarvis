# TASKS — DONE

## Tasks

- id: T-20260208-012
  title: "Otimizar heartbeats: especialistas só rodam quando houver task atribuída (reduzir custo/latência)"
  owner: jarvis
  status: done
  priority: med
  created_at: "2026-02-08"
  updated_at: "2026-02-08"
  context:
    - "Hoje os 5 agentes rodam a cada 30 min mesmo sem tarefa."
  acceptance_criteria:
    - "Definir regra: Jarvis dispara especialista quando move task para DOING (owner=X)"
    - "Manter fallback: heartbeat 60 min para especialistas (opcional) ou desativar quando ocioso"
  deliverables:
    - "Plano + ajuste nos crons (se aprovado)"
  dependencies:
    - ""
  log:
    - "[init] criado no INBOX"
    - "[status 2026-02-08 17:29] inbox->doing by=jarvis"
    - "[status 2026-02-08 18:35] doing->done by=root"

- id: T-20260208-013
  title: "Criar RUNBOOK.md (blocos 100% copiáveis) para operar o Mission Control sem erro de cola"
  owner: jarvis
  status: done
  priority: high
  created_at: "2026-02-08"
  updated_at: "2026-02-08"
  context:
    - "Duplicata de T-20260208-010 (mesmo objetivo), que já foi entregue e validada."
  acceptance_criteria:
    - "Arquivo RUNBOOK.md criado/atualizado na raiz do projeto"
    - "Blocos 100% copiáveis (sem texto misturado dentro de blocos)"
  deliverables:
    - "RUNBOOK.md"
  dependencies:
    - ""
  log:
    - "[init 2026-02-08 17:33] criado no INBOX"
    - "[status 2026-02-08 17:34] inbox->doing by=jarvis"
    - "[status 2026-02-08 18:23] doing->done by=jarvis; reason=duplicata de T-20260208-010"
    - "[status 2026-02-08 18:33] done->review by=root"
    - "[status 2026-02-08 18:33] review->done by=root"

- id: T-20260208-015
  title: "Otimizar heartbeats: especialistas só rodam quando houver task atribuída (reduzir custo/latência)"
  owner: jarvis
  status: done
  priority: med
  created_at: "2026-02-08"
  updated_at: "2026-02-08"
  context:
    - "Duplicata de T-20260208-012 (mesmo objetivo). Fechada para manter 1 fonte de verdade em DOING."
  acceptance_criteria:
    - "Definir estratégia de disparo: especialista só roda quando há task em DOING com owner=ele"
    - "Definir fallback (ex.: heartbeat mais espaçado) e como acordar especialistas"
  deliverables:
    - "Estratégia decidida + plano de implementação"
  dependencies:
    - ""
  log:
    - "[init 2026-02-08 17:33] criado no INBOX"
    - "[status 2026-02-08 17:34] inbox->doing by=jarvis"
    - "[status 2026-02-08 18:23] doing->done by=jarvis; reason=duplicata de T-20260208-012"
    - "[status 2026-02-08 18:33] done->review by=root"
    - "[status 2026-02-08 18:33] review->done by=root"

- id: T-20260208-014
  title: "Padronizar logs de status com hora e autor (by=...) para auditoria"
  owner: jarvis
  status: done
  priority: med
  created_at: "2026-02-08"
  updated_at: "2026-02-08"
  context:
    - "Duplicata de T-20260208-011 (mesmo objetivo), que já foi entregue e validada."
  acceptance_criteria:
    - "Definir padrão consistente para logs (inclui HH:MM e by=...)"
    - "Garantir exemplo nos arquivos e/ou README"
  deliverables:
    - "Padrão documentado + exemplo"
  dependencies:
    - ""
  log:
    - "[init 2026-02-08 17:33] criado no INBOX"
    - "[status 2026-02-08 17:34] inbox->doing by=jarvis"
    - "[status 2026-02-08 18:23] doing->done by=jarvis; reason=duplicata de T-20260208-011"
    - "[status 2026-02-08 18:27] done->review by=root"
    - "[status 2026-02-08 18:27] review->done by=root"

- id: T-20260208-010
  title: "Criar RUNBOOK.md (blocos 100% copiáveis) para operar o Mission Control sem erro de cola"
  owner: devinho
  status: done
  priority: high
  created_at: "2026-02-08"
  updated_at: "2026-02-08"
  context:
    - "Objetivo: evitar colar comandos misturados com texto e reduzir erros de shell."
  acceptance_criteria:
    - "Arquivo RUNBOOK.md criado na raiz do projeto"
    - "Só conter blocos copiáveis (comandos), sem texto no meio do bloco"
    - "Cobrir: entrar na pasta, mci, health, cron.list, criar task, mover task, snapshot, dedupe, format"
  deliverables:
    - "RUNBOOK.md"
  dependencies:
    - ""
  log:
    - "[init] criado no INBOX"
    - "[status 2026-02-08 17:29] inbox->doing by=jarvis"
    - "[status 2026-02-08] doing->review"
    - "[status 2026-02-08 17:54] review->doing by=jarvis"
    - "[status 2026-02-08 18:00] doing->review by=devinho"
    - "[status 2026-02-08 18:23] review->done by=root"

- id: T-20260208-011
  title: "Padronizar logs de status com hora e autor (by=...) para auditoria"
  owner: devinho
  status: done
  priority: med
  created_at: "2026-02-08"
  updated_at: "2026-02-08"
  context:
    - "Hoje temos [status YYYY-MM-DD], mas falta HH:MM e quem fez."
  acceptance_criteria:
    - "Novo padrão: [status YYYY-MM-DD HH:MM] from->to by=<agente>"
    - "Atualizar README_OPERACAO.md com o padrão"
  deliverables:
    - "Definição do padrão + exemplo"
  dependencies:
    - ""
  log:
    - "[init] criado no INBOX"
    - "[status 2026-02-08 17:29] inbox->doing by=jarvis"
    - "[status 2026-02-08 17:32] doing->review by=devinho"
    - "[status 2026-02-08 17:54] review->done by=jarvis"

- id: T-20260208-009
  title: "Deduplicar TASKS_DONE.md (1 entrada por task id) + criar script scripts/dedupe_tasks.py"
  owner: devinho
  status: done
  priority: high
  created_at: "2026-02-08"
  updated_at: "2026-02-08"
  context:
    - "Após testes/movimentações, DONE pode acumular duplicações (mesmo id repetido)."
  acceptance_criteria:
    - "TASKS_DONE.md fica com 1 bloco por id (sem duplicatas)"
    - "Mantém o log mais completo (merge) ou mantém a versão mais recente (definir regra no README)"
    - "Script scripts/dedupe_tasks.py consegue rodar e mostrar o que fez (dry-run e in-place)"
  deliverables:
    - "scripts/dedupe_tasks.py"
    - "scripts/README_dedupe_tasks.md (regras + como usar)"
    - "TASKS_DONE.md deduplicado"
  dependencies:
    - ""
  log:
    - "[init] criado no INBOX"
    - "[triage] 2026-02-08 17:11 BRT — movida para DOING; owner=devinho"
    - "[status 2026-02-08] doing->review"
    - "[status 2026-02-08] review->done"

- id: T-20260208-008
  title: "Atualizar scripts/move_task.py para sempre inserir linha em branco entre tasks ao escrever"
  owner: devinho
  status: done
  priority: med
  created_at: "2026-02-08"
  updated_at: "2026-02-08"
  context:
    - "Após mover tasks, queremos manter consistência sem precisar rodar formatter sempre."
  subtasks:
    - "Entender writer atual do move_task.py e onde ele concatena blocos"
    - "Garantir que a escrita sempre tenha 1 linha em branco entre tasks"
    - "Validar que parser continua aceitando (não quebrar)"
    - "Rodar python -m py_compile scripts/move_task.py"
  acceptance_criteria:
    - "move_task.py gera TASKS_*.md com 1 linha em branco entre tasks"
    - "Não quebra o parser atual"
  deliverables:
    - "Patch em scripts/move_task.py + validação (py_compile)"
  dependencies:
    - "T-20260208-007"
  log:
    - "[init] criado no INBOX"
    - "[triage 2026-02-08 13:25] inbox->doing; owner jarvis->devinho; adicionadas subtasks"
    - "[status 2026-02-08] doing->review"
    - "[status 2026-02-08] review->done"
    - "[status 2026-02-08] done->review"
    - "[status 2026-02-08] review->done"
    - "[status 2026-02-08] done->review"
    - "[status 2026-02-08] review->done"

- id: T-20260208-007
  title: "Higienizar formatação dos TASKS_*.md (separação entre tasks, evitar blocos colados)"
  owner: devinho
  status: done
  priority: high
  created_at: "2026-02-08"
  updated_at: "2026-02-08"
  context:
    - "Hoje alguns arquivos podem ficar com separadores colados (ex.: '34-- id:')."
  subtasks:
    - "Mapear casos problemáticos (ex.: output atual do move_task.py)"
    - "Implementar scripts/format_tasks.py para normalizar 1 linha em branco entre tasks"
    - "Rodar formatter em todos TASKS_*.md e validar legibilidade"
    - "Escrever README curto com instruções e exemplo"
  acceptance_criteria:
    - "Todos os arquivos TASKS_*.md ficam legíveis: 1 linha em branco entre blocos de tasks"
    - "Sem linhas soltas ou duplicações estranhas na seção ## Tasks"
  deliverables:
    - "Um script scripts/format_tasks.py (ou .sh) que normaliza a formatação"
    - "README curto com como usar"
  dependencies:
    - ""
  log:
    - "[init] criado no INBOX"
    - "[status 2026-02-08] inbox->doing"
    - "[triage 2026-02-08 13:25] owner jarvis->devinho; detalhadas subtasks"
    - "[status 2026-02-08] doing->review"
    - "[status 2026-02-08] review->done"
    - "[status 2026-02-08] done->review"
    - "[status 2026-02-08] review->done"

- id: T-20260208-006
  title: "Automatizar movimentação de tasks (INBOX/DOING/REVIEW/DONE/BLOCKED) + registrar [status YYYY-MM-DD]"
  owner: devinho
  status: done
  priority: high
  created_at: "2026-02-08"
  updated_at: "2026-02-08"
  context:
    - "Hoje temos scripts/create_task.py e create_task.sh, mas não temos um 'move_task' padronizado."
    - "Meta: padronizar move + log em 1 comando (CLI), mantendo compatível com o formato YAML-ish atual dos arquivos."
  acceptance_criteria:
    - "Comando único move task entre colunas e adiciona linha no log: [status YYYY-MM-DD] <from>-><to>"
    - "Evitar uso de ferramenta edit pelo agente (gerar conteúdo final completo quando precisar)"
  deliverables:
    - "scripts/move_task.py (ou .sh) + README"
    - "Exemplo de uso no README"
  dependencies:
    - "scripts/create_task.py (já existe)"
  log:
    - "[init] criado no INBOX"
    - "[triage 2026-02-08] movido para DOING (owner confirmado: devinho)"
    - "[status 2026-02-08] inbox->doing"
    - "[plan 2026-02-08] subtarefas: (1) definir interface CLI (args: id, to, --owner opcional, --reason p/ blocked); (2) implementar parser/serializer (preservar ordem); (3) atualizar updated_at + log; (4) testes rápidos (py_compile + casos simples); (5) README com exemplos"
    - "[status 2026-02-08] doing->review"
    - "[status 2026-02-08] review->done"

- id: T-20260207-002
  title: "Criar script simples: criar task nova e inserir no INBOX"
  owner: devinho
  status: done
  priority: med
  created_at: "2026-02-07"
  updated_at: "2026-02-08"
  context:
    - "Usar templates/TASK_TEMPLATE.md"
  acceptance_criteria:
    - "1 comando cria task com id e insere no TASKS_INBOX.md"
  deliverables:
    - "scripts/create_task.sh (ou .py) + instruções"
  dependencies:
    - ""
  log:
    - "[init] criado no INBOX"
    - "[triage 2026-02-08] movido para DOING (owner confirmado: devinho)"
    - "[deliver 2026-02-08] entregue: scripts/create_task.py + scripts/create_task.sh + scripts/README_create_task.md; valida: python3 -m py_compile scripts/create_task.py"
    - "[review 2026-02-08] validado: scripts existem e py_compile OK"
    - "[status 2026-02-08] review->done"

- id: T-20260207-003
  title: "Definir guia mínimo de UI (futuro Kanban web): wireframe + componentes"
  owner: desire
  status: done
  priority: low
  created_at: "2026-02-07"
  updated_at: "2026-02-08"
  context:
    - "Somente texto/descrição"
  acceptance_criteria:
    - "1 wireframe simples + lista de componentes"
  deliverables:
    - "Resumo no log"
  dependencies:
    - ""
  log:
    - "[init] criado no INBOX"
    - "[triage 2026-02-08] movido para DOING (owner confirmado: desire)"
    - "[deliver 2026-02-08] Guia mínimo de UI (Kanban web) — wireframe + componentes:"
    - "[wireframe] Layout (desktop): Header fixo (logo/nome do board à esquerda; busca; botões: +Task, Filtros, Export); faixa de filtros (Owner, Priority, Status, tag, data); corpo em colunas horizontais (INBOX | DOING | REVIEW | DONE | BLOCKED), scroll horizontal; cada coluna com contador + botão +; cards com título 1 linha, badges (priority/status), owner, meta (id, updated_at); painel lateral/drawer de detalhes ao clicar no card; modal de criação/edição com campos essenciais; rodapé opcional com info de sync/última atualização."
    - "[wireframe] Mobile: header compacto + busca; colunas viram tabs/segmented control; cards em lista; detalhes em tela dedicada (stack navigation)."
    - "[componentes] BoardHeader; SearchInput; PrimaryButton (+Task); FilterBar (chips/combos); Column (title+count, add); TaskCard; Badge (Priority/Status); OwnerChip/Avatar; TagChip; TaskDetailsDrawer (fields + log timeline); TaskFormModal (create/edit); Timeline/LogItem; EmptyState; Toast/Notification; ConfirmDialog; LoadingSkeleton."
    - "[tokens mínimos] Spacing 4/8/12/16/24; radius 8; font: 14/16/20; cores: background neutro, texto alto contraste, badges por status (INBOX=cinza, DOING=azul, REVIEW=roxo, DONE=verde, BLOCKED=vermelho), priority (low=cinza, med=laranja, high=vermelho)."
    - "[review 2026-02-08] validado (entrega textual ok)"
    - "[status 2026-02-08] review->done"

- id: T-20260207-004
  title: "Definir métricas do squad: lead time, throughput, aging, bloqueios"
  owner: analise
  status: done
  priority: low
  created_at: "2026-02-07"
  updated_at: "2026-02-08"
  context:
    - "Operação via arquivos"
  acceptance_criteria:
    - "Lista de métricas + como medir em arquivos"
  deliverables:
    - "Tabela no log"
  dependencies:
    - ""
  log:
    - "[init] criado no INBOX"
    - "[triage 2026-02-08] movido para DOING (owner confirmado: analise)"
    - "[deliver 2026-02-08] Métricas do squad (definição + como medir via arquivos):"
    - "| Métrica | O que responde | Como medir (com os arquivos atuais) | Observações/ajustes recomendados |"
    - "|---|---|---|---|"
    - "| Lead time (end-to-end) | Quanto tempo uma task leva do pedido ao valor entregue | Para cada task em TASKS_DONE.md: `lead_time = data_done - created_at`. `data_done` pode ser `updated_at` no DONE **ou** a data do log `[done YYYY-MM-DD]`/`[deliver YYYY-MM-DD]` quando a task foi movida para DONE. Agregar por semana/mês (mediana + p85). | Recomendado padronizar o evento de conclusão no log: `\"[done YYYY-MM-DD] movido para DONE\"` para evitar ambiguidade do `updated_at`. |"
    - "| Throughput (entregas) | Quantas tasks o time entrega por período | Contar # de tasks em TASKS_DONE.md por semana (ex.: agrupar por `updated_at` ou pelo evento `[done YYYY-MM-DD]`). Reportar total/semana + média móvel 4 semanas. | Se houver reabertura, usar o **último** `[done]` ou registrar `[reopen]` explicitamente. |"
    - "| Aging (idade do WIP) | Há quanto tempo as tasks abertas estão paradas/sem finalizar | Para tasks em INBOX/DOING/REVIEW: `aging = hoje - updated_at` (proxy). Melhor: `hoje - data_última_mudança_de_status` (extraída do log). Reportar: lista das top N mais antigas + histograma por faixas (0-2d, 3-7d, 8-14d, 15d+). | Com o padrão atual, `updated_at` mistura mudanças pequenas vs. mudança de status; por isso o ideal é logar status-change com data. |"
    - "| Bloqueios (volume) | Quantas tasks ficam bloqueadas e por quê | Contar tasks em TASKS_BLOCKED.md (WIP bloqueado) + # eventos `[blocked YYYY-MM-DD]` no log (fluxo). Classificar por motivo (tag no texto: `reason=...`). | Recomendado padronizar o log: `\"[blocked YYYY-MM-DD] reason=<categoria> detalhe=...\"` e `\"[unblocked YYYY-MM-DD]\"`. |"
    - "| Tempo bloqueado (blocked time) | Quanto tempo total o time perde em bloqueios | Para cada task bloqueada: `blocked_time = hoje - data_blocked` (se ainda em BLOCKED) ou `data_unblocked - data_blocked` (se já saiu). Datas vêm do log `[blocked]`/`[unblocked]`. Agregar por semana (soma) e por categoria (pareto). | Exige capturar no log as transições blocked/unblocked com data (senão fica impossível medir bem). |"
    - "[convenção mínima sugerida p/ medição confiável] Em qualquer move de coluna, acrescentar 1 linha no log com data e estado: `\"[status YYYY-MM-DD] inbox->doing\"`, `\"[status YYYY-MM-DD] doing->review\"`, `\"[status YYYY-MM-DD] review->done\"`, `\"[status YYYY-MM-DD] any->blocked reason=...\"`, `\"[status YYYY-MM-DD] blocked->doing\"`. Assim dá para medir lead time, cycle time e blocked time sem depender de `updated_at`."
    - "[review 2026-02-08] validado (entrega textual ok)"
    - "[status 2026-02-08] review->done"

- id: T-20260207-005
  title: "Definir tom de voz e formatos padrão de entrega (copy)"
  owner: copinho
  status: done
  priority: low
  created_at: "2026-02-07"
  updated_at: "2026-02-08"
  context:
    - "PT-BR, objetivo"
  acceptance_criteria:
    - "Guia curto + exemplos"
  deliverables:
    - "Guia no log"
  dependencies:
    - ""
  log:
    - "[init] criado no INBOX"
    - "[triage 2026-02-08] movido para DOING (owner confirmado: copinho)"
    - "[deliver 2026-02-08] Tom de voz (Mission Control / mensagens internas):"
    - "[princípios] 1) Direto e útil (sem enrolação). 2) Contexto mínimo necessário (1-2 linhas). 3) Ação explícita (o que fazer/decidir). 4) Sem hype, sem jargão, sem emoji por padrão. 5) Escrever para leitura rápida (frases curtas, listas)."
    - "[tom] Profissional informal (PT-BR neutro). Preferir verbos de ação. Evitar adjetivos vagos (\"incrível\", \"top\"); trocar por fato/resultado (\"reduz tempo\", \"resolve X\")."
    - "[formatação] Usar: Título curto + bullets. Para decisões: \"Decisão\" + \"Motivo\" + \"Próximos passos\". Para updates: \"Feito\" / \"Em andamento\" / \"Bloqueado\"."
    - "[padrão de update] Exemplo: `Status: DOING | Feito: movi task X p/ REVIEW | Em andamento: Y | Próximo: Z | Bloqueio: (se houver, com pedido claro)`"
    - "[padrão de entrega] Exemplo: `Entregue: <o que> | Onde: <arquivo/link> | Como validar: <passos> | Observações: <trade-offs/limites>`"
    - "[padrão de pedido] Exemplo: `Preciso de: <decisão/insumo> | Até: <data/hora> | Opções: A/B (recomendação)`"
    - "[mensagens p/ usuário] Regra: começar pelo que muda pra pessoa. Estrutura: `O que aconteceu` → `O que isso significa` → `O que eu preciso de você (se precisar)` → `Próximo passo/tempo`."
    - "[microcopy] Botões: verbos no imperativo (\"Criar task\", \"Mover p/ REVIEW\", \"Marcar como DONE\"). Confirmações: explicar consequência (\"Isso vai mover a task para DONE e fechar o ciclo\"). Erros: dizer o que falhou + como resolver (\"Não consegui ler o arquivo X — confirme o caminho\")."
    - "[anti-padrões] Evitar: \"Qualquer coisa me avise\"; \"Vou dar uma olhada\" sem prazo; parágrafos longos; siglas sem expandir na 1ª vez."
    - "[review 2026-02-08] validado (entrega textual ok)"
    - "[status 2026-02-08] review->done"

- id: T-20260207-001
  title: "Bootstrap do Mission Control — triagem e distribuição"
  owner: jarvis
  status: done
  priority: high
  created_at: "2026-02-07"
  updated_at: "2026-02-08"
  context:
    - "Instância: openclaw-mc (ws://127.0.0.1:18790)"
  acceptance_criteria:
    - "Cada especialista com 1 task em DOING"
    - "WORKING.md atualizado com o status"
  deliverables:
    - "WORKING.md atualizado"
  dependencies:
    - ""
  log:
    - "[init] criado no INBOX"
    - "[triage 2026-02-08] movido para DOING (owner confirmado: jarvis)"
    - "[deliver 2026-02-08] triagem rodada; tasks distribuídas aos especialistas; WORKING.md sincronizado"
    - "[review 2026-02-08] especialistas entregaram (T-002..T-005) e foram validados; bootstrap encerrado"
    - "[status 2026-02-08] doing->review"
    - "[status 2026-02-08] review->done"
