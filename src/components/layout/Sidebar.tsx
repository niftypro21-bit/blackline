import Link from "next/link";
import { SignOutButton } from "@/components/layout/SignOutButton";

const NAV = [
  { href: "/", label: "Tableau de bord" },
  { href: "/annuaire", label: "Annuaire" },
  { href: "/vehicules", label: "Vehicules" },
  { href: "/organisations", label: "Organisations" },
  { href: "/lieux", label: "Lieux" },
  { href: "/observations", label: "Observations" },
  { href: "/relations", label: "Relations" },
  { href: "/journal", label: "Journal" },
  { href: "/agenda", label: "Agenda" },
  { href: "/mc", label: "MC" },
  { href: "/recherche", label: "Recherche" },
  { href: "/archives", label: "Archives" },
];

export function Sidebar({ userName }: { userName: string }) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-panel">
      <div className="border-b border-border-subtle px-5 py-5">
        <p className="font-display text-lg tracking-widest text-accent">BLACKBOOK</p>
        <p className="mt-1 text-xs text-muted">
          Carnet personnel — usage prive, hors-RP. Pas un outil officiel du MC.
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-panel-raised hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-border-subtle px-5 py-4">
        <p className="truncate text-xs text-muted">{userName}</p>
        <SignOutButton />
      </div>
    </aside>
  );
}
