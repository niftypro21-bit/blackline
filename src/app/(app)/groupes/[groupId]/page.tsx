import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { hasGroupAccess, listAccessibleChannels } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { ForbiddenError } from "@/lib/permissions";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppointmentForm } from "@/components/forms/AppointmentForm";

export default async function GroupSpacePage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const session = await requireSession();

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) notFound();

  const allowed = await hasGroupAccess(session.user.id, session.user.role, groupId);
  if (!allowed) throw new ForbiddenError("Acces a ce groupe non autorise.");

  const [channels, appointments] = await Promise.all([
    listAccessibleChannels(session.user.id, session.user.role, groupId),
    prisma.appointment.findMany({
      where: { groupId },
      orderBy: { scheduledAt: "asc" },
      include: { proposedBy: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">{group.name}</h1>
        {group.description ? <p className="mt-1 text-sm text-muted">{group.description}</p> : null}
      </div>

      <Card>
        <CardHeader title="Salons" />
        <CardBody className="p-0">
          {channels.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Aucun salon accessible dans ce groupe" />
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {channels.map((channel) => (
                <li key={channel.id}>
                  <Link href={`/messages/${channel.id}`} className="block px-5 py-3 text-sm hover:bg-panel-raised">
                    # {channel.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Proposer un rendez-vous" />
        <CardBody>
          <AppointmentForm groups={[group]} fixedGroupId={group.id} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Rendez-vous du groupe" />
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
                    <span className="text-xs text-muted">{appointment.scheduledAt.toLocaleString("fr-FR")}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {appointment.location ? `${appointment.location} — ` : ""}propose par {appointment.proposedBy.name}
                  </p>
                  {appointment.description ? <p className="mt-1 text-sm text-muted">{appointment.description}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
