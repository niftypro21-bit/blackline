import { requireSession } from "@/lib/session";
import { listAccessibleGroups, listAccessibleGroupIds } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppointmentForm } from "@/components/forms/AppointmentForm";

export default async function RendezVousPage() {
  const session = await requireSession();
  const groups = await listAccessibleGroups(session.user.id, session.user.role);
  const groupIds = await listAccessibleGroupIds(session.user.id, session.user.role);

  const appointments = await prisma.appointment.findMany({
    where: { groupId: { in: groupIds } },
    orderBy: { scheduledAt: "asc" },
    include: { group: true, proposedBy: true },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Rendez-vous</h1>
        <p className="mt-1 text-sm text-muted">Visibles uniquement pour les groupes auxquels vous avez acces.</p>
      </div>

      <Card>
        <CardHeader title="Proposer un rendez-vous" />
        <CardBody>
          {groups.length === 0 ? (
            <EmptyState title="Aucun groupe accessible" description="Demandez au proprietaire de vous donner acces a un groupe." />
          ) : (
            <AppointmentForm groups={groups} />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="A venir" />
        <CardBody className="p-0">
          {appointments.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Aucun rendez-vous" />
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {appointments.map((appointment) => (
                <li key={appointment.id} className="px-5 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-foreground">{appointment.title}</span>
                    <span className="text-xs text-muted">
                      {appointment.scheduledAt.toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {appointment.group.name}
                    {appointment.location ? ` — ${appointment.location}` : ""} — propose par{" "}
                    {appointment.proposedBy.name}
                  </p>
                  {appointment.description ? (
                    <p className="mt-1 text-sm text-muted">{appointment.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
