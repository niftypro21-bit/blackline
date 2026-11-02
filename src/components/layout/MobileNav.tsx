"use client";

import Link from "next/link";
import { useState } from "react";
import { SignOutButton } from "@/components/layout/SignOutButton";

type NavUser = { name: string; isOwner: boolean; showAccounting: boolean };

function navItems(user: NavUser) {
  const items = [
    { href: "/", label: "Tableau de bord" },
    { href: "/messages", label: "Messages" },
    { href: "/inventaire", label: "Inventaire" },
    { href: "/commandes", label: "Commandes" },
    { href: "/rendez-vous", label: "Rendez-vous" },
  ];
  if (user.showAccounting) items.push({ href: "/comptabilite", label: "Comptabilite" });
  if (user.isOwner) items.push({ href: "/administration", label: "Administration" });
  return items;
}

export function MobileNav({ user }: { user: NavUser }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between border-b border-border bg-panel px-4 py-3">
        <p className="font-display text-base tracking-widest text-accent glow-text">BLACKLINE</p>
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="rounded-md border border-border px-2.5 py-1.5 text-sm text-muted"
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="relative flex w-72 flex-col border-r border-border bg-panel">
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-5">
              <p className="font-display text-lg tracking-widest text-accent glow-text">BLACKLINE</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="text-muted"
              >
                &times;
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="flex flex-col gap-0.5">
                {navItems(user).map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
