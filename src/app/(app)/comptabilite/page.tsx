import { requireAccountingSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatTile } from "@/components/ui/StatTile";
import { Button } from "@/components/ui/Button";
import { AccountingEntryForm } from "@/components/forms/AccountingEntryForm";
import { deleteAccountingEntry } from "@/lib/actions/accounting";
import { labelFor, ACCOUNTING_ENTRY_TYPES } from "@/lib/constants";

export default async function ComptabilitePage() {
  await requireAccountingSession();

  const entries = await prisma.accountingEntry.findMany({
    orderBy: { date: "desc" },
    include: { createdBy: true },
  });

  const balance = entries.reduce(
    (total, entry) => total + (entry.type === "RECETTE" ? entry.amount : -entry.amount),
    0,
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Comptabilite</h1>
        <p className="mt-1 text-sm text-muted">Montants fictifs, usage RP uniquement.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Solde" value={balance} />
      </div>

      <Card>
        <CardHeader title="Nouvelle entree" />
        <CardBody>
          <AccountingEntryForm />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Historique" />
        <CardBody className="p-0">
          {entries.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Aucune entree" />
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {entries.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                  <div>
                    <p className="text-foreground">
                      {labelFor(ACCOUNTING_ENTRY_TYPES, entry.type as never)} — {entry.label}
                    </p>
                    <p className="text-xs text-muted">
                      {entry.date.toLocaleDateString("fr-FR")} — ajoute par {entry.createdBy.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={entry.type === "RECETTE" ? "text-accent" : "text-status-refused"}>
                      {entry.type === "RECETTE" ? "+" : "-"}
                      {entry.amount}
                    </span>
                    <form action={deleteAccountingEntry.bind(null, entry.id)}>
                      <Button type="submit" variant="ghost">
                        Supprimer
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
