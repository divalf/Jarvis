import Link from "next/link";

export default function TaskFilters({
  current,
}: {
  current: "all" | "today" | "overdue" | "backlog";
}) {
  const items: Array<{ key: typeof current; label: string; href: string }> = [
    { key: "all", label: "Todas", href: "/app" },
    { key: "today", label: "Hoje", href: "/app?filter=today" },
    { key: "overdue", label: "Atrasadas", href: "/app?filter=overdue" },
    { key: "backlog", label: "Backlog", href: "/app?filter=backlog" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <Link
          key={it.key}
          href={it.href}
          className={
            it.key === current
              ? "rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white"
              : "rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
          }
        >
          {it.label}
        </Link>
      ))}
    </div>
  );
}
