import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { archiveFromForm } from "@/lib/actions/archive";
import { toggleTask } from "@/lib/actions/journal";
import { personDisplayName } from "@/lib/format";

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const entry = await prisma.journalEntry.findUnique({
    where: { id },
    include: {
      peopleMet: { include: { person: true } },
      tasksSpawned: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!entry) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Journal</p>
          <h1 className="font-display text-2xl tracking-wide text-foreground">
            {entry.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </h1>
          {entry.mood ? <p className="mt-1 text-sm text-muted">Humeur : {entry.mood}</p> : null}
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/journal/${entry.id}/modifier`}>Modifier</LinkButton>
          <form action={archiveFromForm}>
            <input type="hidden" name="entityType" value="JOURNAL_ENTRY" />
            <input type="hidden" name="entityId" value={entry.id} />
            <input type="hidden" name="redirectTo" value="/journal" />
            <ConfirmButton confirmMessage="Archiver cette entree ?">Archiver</ConfirmButton>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader title="Evenements de la journee" />
            <CardBody>
              <p className="whitespace-pre-wrap text-sm text-foreground">{entry.content}</p>
            </CardBody>
          </Card>

          {entry.thingsLearned ? (
            <Card>
              <CardHeader title="Choses apprises" />
              <CardBody>
                <p className="whitespace-pre-wrap text-sm text-foreground">{entry.thingsLearned}</p>
              </CardBody>
            </Card>
          ) : null}

          {entry.thingsToVerify ? (
            <Card>
              <CardHeader title="Choses a verifier" />
              <CardBody>
                <p className="whitespace-pre-wrap text-sm text-foreground">{entry.thingsToVerify}</p>
              </CardBody>
            </Card>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Personnes rencontrees" />
            <CardBody className="p-0">
              {entry.peopleMet.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted">Aucune.</p>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {entry.peopleMet.map((meeting) => (
                    <li key={meeting.id}>
                      <Link
                        href={`/annuaire/${meeting.person.id}`}
                        className="block px-5 py-3 text-sm hover:bg-panel-raised"
                      >
                        {personDisplayName(meeting.person)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Choses a faire" />
            <CardBody className="p-0">
              {entry.tasksSpawned.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted">Aucune tache.</p>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {entry.tasksSpawned.map((task) => (
                    <li key={task.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                      <form action={toggleTask}>
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="done" value={String(task.done)} />
                        <button type="submit" className="flex items-center gap-2">
                          <span
                            className={
                              task.done
                                ? "h-3.5 w-3.5 rounded-sm border border-accent bg-accent"
                                : "h-3.5 w-3.5 rounded-sm border border-border"
                            }
                          />
                        </button>
                      </form>
                      <span className={task.done ? "text-muted line-through" : "text-foreground"}>
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
