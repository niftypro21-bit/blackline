import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { hasChannelAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { ForbiddenError } from "@/lib/permissions";
import { MessageForm } from "@/components/forms/MessageForm";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function ChannelPage({ params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  const session = await requireSession();

  const channel = await prisma.channel.findUnique({ where: { id: channelId }, include: { group: true } });
  if (!channel) notFound();

  const allowed = await hasChannelAccess(session.user.id, session.user.role, channelId);
  if (!allowed) throw new ForbiddenError("Acces a ce salon non autorise.");

  const messages = await prisma.message.findMany({
    where: { channelId },
    orderBy: { createdAt: "asc" },
    include: { author: true },
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="border-b border-border px-1 pb-4">
        <h1 className="font-display text-xl tracking-wide text-foreground">
          # {channel.name} <span className="text-sm text-muted">— {channel.group.name}</span>
        </h1>
        {channel.description ? <p className="mt-1 text-sm text-muted">{channel.description}</p> : null}
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Aucun message pour le moment" description="Soyez le premier a ecrire ici." />
          </div>
        ) : (
          <ul className="flex flex-col gap-3 px-1 py-4">
            {messages.map((message) => (
              <li key={message.id} className="rounded-md border border-border-subtle bg-panel px-4 py-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-accent">{message.author.name}</span>
                  <span className="text-xs text-muted">{message.createdAt.toLocaleString("fr-FR")}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{message.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <MessageForm channelId={channel.id} />
    </div>
  );
}
