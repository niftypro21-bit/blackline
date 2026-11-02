import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canApproveOrders } from "@/lib/permissions";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { decideOrder } from "@/lib/actions/orders";

export default async function CommandesPage() {
  const session = await auth();
  const user = session!.user;
  const canApprove = canApproveOrders(user.role);

  const [myOrders, pendingOrders] = await Promise.all([
    prisma.order.findMany({
      where: { requestedById: user.id },
      orderBy: { createdAt: "desc" },
      include: { catalogItem: true },
    }),
    canApprove
      ? prisma.order.findMany({
          where: { status: "EN_ATTENTE" },
          orderBy: { createdAt: "asc" },
          include: { catalogItem: true, requestedBy: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Commandes</h1>
        <p className="mt-1 text-sm text-muted">Reservations issues du catalogue, en attente d&apos;approbation.</p>
      </div>

      {canApprove ? (
        <Card>
          <CardHeader title="File d'approbation" subtitle="Commandes en attente de toute la communaute" />
          <CardBody className="p-0">
            {pendingOrders.length === 0 ? (
              <div className="p-5">
                <EmptyState title="Aucune commande en attente" />
              </div>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {pendingOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div className="text-sm">
                      <p className="text-foreground">
                        {order.quantity} x {order.catalogItem.name}
                      </p>
                      <p className="text-xs text-muted">
                        Demande par {order.requestedBy.name} — {order.createdAt.toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <form action={decideOrder.bind(null, order.id, true)}>
                        <Button type="submit" variant="primary">
                          Approuver
                        </Button>
                      </form>
                      <form action={decideOrder.bind(null, order.id, false)}>
                        <Button type="submit" variant="danger">
                          Refuser
                        </Button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Mes commandes" />
        <CardBody className="p-0">
          {myOrders.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Vous n'avez pas encore de commande" actionHref="/inventaire" actionLabel="Voir le catalogue" />
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {myOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span>
                    {order.quantity} x {order.catalogItem.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">{order.createdAt.toLocaleDateString("fr-FR")}</span>
                    <OrderStatusBadge value={order.status} />
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
