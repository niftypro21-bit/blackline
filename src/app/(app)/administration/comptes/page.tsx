import { requireOwnerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { AccountForm } from "@/components/forms/AccountForm";
import { AccountRow } from "@/components/forms/AccountRow";
import { setAccountRole, setAccountActive, setAccountingPermission } from "@/lib/actions/accounts";

export default async function ComptesPage() {
  await requireOwnerSession();

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Comptes</h1>
        <p className="mt-1 text-sm text-muted">Creation, roles, desactivation et reinitialisation de mot de passe.</p>
      </div>

      <Card>
        <CardHeader title="Creer un compte" />
        <CardBody>
          <AccountForm />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Comptes existants" />
        <CardBody className="p-0">
          <ul className="divide-y divide-border-subtle">
            {users.map((user) => (
              <AccountRow
                key={user.id}
                user={user}
                onRoleChange={setAccountRole}
                onActiveToggle={setAccountActive}
                onAccountingToggle={setAccountingPermission}
              />
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
