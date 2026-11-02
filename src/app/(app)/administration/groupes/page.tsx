import { requireOwnerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { GroupForm } from "@/components/forms/GroupForm";
import { ChannelForm } from "@/components/forms/ChannelForm";
import { AccessCheckbox } from "@/components/forms/AccessCheckbox";
import { deleteGroup, setGroupAccess } from "@/lib/actions/groups";
import { deleteChannel, setChannelAccess } from "@/lib/actions/channels";

export default async function GroupesPage() {
  await requireOwnerSession();

  const [groups, users] = await Promise.all([
    prisma.group.findMany({
      orderBy: { name: "asc" },
      include: { channels: { orderBy: { name: "asc" } }, members: true },
    }),
    prisma.user.findMany({
      where: { role: { not: "OWNER" } },
      orderBy: { name: "asc" },
      include: { channelAccess: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Groupes & salons</h1>
        <p className="mt-1 text-sm text-muted">
          Chaque groupe isole ses salons et rendez-vous. L&apos;acces se gere par compte.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Nouveau groupe" />
          <CardBody>
            <GroupForm />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Nouveau salon" />
          <CardBody>
            {groups.length === 0 ? (
              <p className="text-sm text-muted">Creez d&apos;abord un groupe.</p>
            ) : (
              <ChannelForm groups={groups} />
            )}
          </CardBody>
        </Card>
      </div>

      {groups.map((group) => {
        const groupMemberIds = new Set(group.members.map((m) => m.userId));

        return (
          <Card key={group.id}>
            <CardHeader
              title={group.name}
              subtitle={group.description}
              action={
                <form action={deleteGroup.bind(null, group.id)}>
                  <ConfirmButton confirmMessage={`Supprimer le groupe "${group.name}" et tout son contenu ?`}>
                    Supprimer
                  </ConfirmButton>
                </form>
              }
            />
            <CardBody className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-muted">Salons</p>
                {group.channels.length === 0 ? (
                  <p className="text-sm text-muted">Aucun salon dans ce groupe.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {group.channels.map((channel) => (
                      <li key={channel.id} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2">
                        <span className="text-sm text-foreground">
                          # {channel.name}
                          {channel.description ? <span className="text-muted"> — {channel.description}</span> : null}
                        </span>
                        <form action={deleteChannel.bind(null, channel.id)}>
                          <Button type="submit" variant="ghost">
                            Supprimer
                          </Button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-muted">Acces par compte</p>
                {users.length === 0 ? (
                  <p className="text-sm text-muted">Aucun compte autre que le proprietaire.</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs text-muted">
                        <th className="py-1 pr-3">Compte</th>
                        <th className="py-1 pr-3">Groupe</th>
                        {group.channels.map((channel) => (
                          <th key={channel.id} className="py-1 pr-3"># {channel.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const channelMemberIds = new Set(user.channelAccess.map((c) => c.channelId));
                        return (
                          <tr key={user.id} className="border-t border-border-subtle">
                            <td className="py-2 pr-3 text-foreground">{user.name}</td>
                            <td className="py-2 pr-3">
                              <AccessCheckbox
                                checked={groupMemberIds.has(user.id)}
                                onToggle={setGroupAccess.bind(null, user.id, group.id)}
                              />
                            </td>
                            {group.channels.map((channel) => (
                              <td key={channel.id} className="py-2 pr-3">
                                <AccessCheckbox
                                  checked={channelMemberIds.has(channel.id)}
                                  onToggle={setChannelAccess.bind(null, user.id, channel.id)}
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
