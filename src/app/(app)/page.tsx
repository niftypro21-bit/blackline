import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listAccessibleGroupIds } from "@/lib/access";
import { canApproveOrders, isOwner } from "@/lib/permissions";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function DashboardPage() {
  const session = await auth();
  const user = session!.user;
  const groupIds = await listAccessibleGroupIds(user.id, user.role);
  const canApprove = canApproveOrders(user.role);
  const owner = isOwner(user.role);

  const [pendingOrders, myOrders, upcomingAppointments, recentActivity] = await Promise.all([
    canApprove ? prisma.order.count({ where: { status: "EN_ATTENTE" } }) : 0,
    prisma.order.count({ where: { requestedById: user.id, status: "EN_ATTENTE" } }),
    prisma.appointment.findMany({
      where: { groupId: { in: groupIds }, scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: { group: true },
    }),
    owner
      ? prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: true } })
      : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted">Vue d&apos;ensemble de BLACKLINE.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {canApprove ? (
          <StatTile label="Commandes en attente" value={pendingOrders} href="/commandes" />
        ) : null}
        <StatTile label="Mes commandes en attente" value={myOrders} href="/commandes" />
        <StatTile label="Rendez-vous a venir" value={upcomingAppointments.length} href="/rendez-vous" />
      </div>

      <div className={`grid gap-6 ${owner ? "lg:grid-cols-2" : ""}`}>
        <Card>
          <CardHeader title="Prochains rendez-vous" />
          <CardBody className="p-0">
            {upcomingAppointments.length === 0 ? (
              <div className="p-5">
                <EmptyState title="Aucun rendez-vous a venir" />
              </div>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {upcomingAppointments.map((appointment) => (
                  <li key={appointment.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span>
                      {appointment.title} <span className="text-muted">— {appointment.group.name}</span>
                    </span>
                    <span className="text-xs text-muted">
                      {appointment.scheduledAt.toLocaleString("fr-FR")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {owner ? (
          <Card>
            <CardHeader title="Activite recente" />
            <CardBody className="p-0">
              {recentActivity.length === 0 ? (
                <div className="p-5">
                  <EmptyState title="Aucune activite enregistree" />
                </div>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {recentActivity.map((entry) => (
                    <li key={entry.id} className="px-5 py-3 text-sm text-muted">
                      <span className="text-foreground">{entry.user?.name ?? "Systeme"}</span> —{" "}
                      {entry.action} {entry.entityType}
                      <span className="float-right text-xs">
                        {entry.createdAt.toLocaleString("fr-FR")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        ) : null}
      </div>

      <p className="text-xs text-muted">
        Rappel : toutes les donnees, montants et articles de ce site sont fictifs et servent
        uniquement au jeu de role. <Link href="/rendez-vous" className="text-accent hover:underline">Voir l&apos;agenda complet</Link>.
      </p>
    </div>
  );
}
