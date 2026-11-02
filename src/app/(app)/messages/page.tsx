import Link from "next/link";
import { requireSession } from "@/lib/session";
import { listAccessibleGroups, listAccessibleChannels } from "@/lib/access";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function MessagesPage() {
  const session = await requireSession();
  const groups = await listAccessibleGroups(session.user.id, session.user.role);

  const groupsWithChannels = await Promise.all(
    groups.map(async (group) => ({
      group,
      channels: await listAccessibleChannels(session.user.id, session.user.role, group.id),
    })),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Messages</h1>
        <p className="mt-1 text-sm text-muted">Groupes et salons auxquels vous avez acces.</p>
      </div>

      {groupsWithChannels.length === 0 ? (
        <EmptyState
          title="Aucun groupe accessible"
          description="Demandez au proprietaire de vous donner acces a un groupe et un salon."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {groupsWithChannels.map(({ group, channels }) => (
            <Card key={group.id}>
              <CardHeader title={group.name} subtitle={group.description} />
              <CardBody className="p-0">
                {channels.length === 0 ? (
                  <div className="p-5">
                    <EmptyState title="Aucun salon accessible dans ce groupe" />
                  </div>
                ) : (
                  <ul className="divide-y divide-border-subtle">
                    {channels.map((channel) => (
                      <li key={channel.id}>
                        <Link
                          href={`/messages/${channel.id}`}
                          className="block px-5 py-3 text-sm hover:bg-panel-raised"
                        >
                          # {channel.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
