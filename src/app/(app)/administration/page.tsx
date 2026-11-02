import Link from "next/link";
import { requireOwnerSession } from "@/lib/session";
import { Card, CardHeader } from "@/components/ui/Card";

export default async function AdministrationPage() {
  await requireOwnerSession();

  const sections = [
    { href: "/administration/comptes", title: "Comptes", description: "Creer, modifier, desactiver les comptes et attribuer les roles." },
    { href: "/administration/groupes", title: "Groupes & salons", description: "Creer des groupes et salons, gerer les acces par compte." },
    { href: "/administration/parametres", title: "Parametres", description: "Configurer le webhook Discord." },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Administration</h1>
        <p className="mt-1 text-sm text-muted">Reserve au proprietaire.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition-colors hover:border-accent/40">
              <CardHeader title={section.title} subtitle={section.description} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
