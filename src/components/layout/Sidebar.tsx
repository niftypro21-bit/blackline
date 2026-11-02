import Link from "next/link";
import { SignOutButton } from "@/components/layout/SignOutButton";

type NavUser = { name: string; isOwner: boolean; showAccounting: boolean };

function navItems(user: NavUser) {
  const items = [
    { href: "/", label: "Tableau de bord" },
    { href: "/groupes", label: "Groupes" },
    { href: "/messages", label: "Messages" },
    { href: "/inventaire", label: "Marche noir" },
    { href: "/commandes", label: "Commandes" },
    { href: "/rendez-vous", label: "Rendez-vous" },
  ];
  if (user.showAccounting) items.push({ href: "/comptabilite", label: "Comptabilite" });
  if (user.isOwner) items.push({ href: "/administration", label: "Administration" });
  return items;
}

export function Sidebar({ user }: { user: NavUser }) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-panel">
      <div className="border-b border-border-subtle px-5 py-5">
        <p className="font-display text-lg tracking-widest text-accent glow-text">BLACKLINE</p>
        <p className="mt-1 text-xs text-muted">
          Tablette de gestion — communaute fictive, usage RP uniquement.
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {navItems(user).map((item) => (
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
        <p className="truncate text-xs text-muted">{user.name}</p>
        <SignOutButton />
      </div>
    </aside>
  );
}
