import Link from "next/link";
import { getDossierContext, dossierPathFor } from "@/lib/dossier";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge, ReliabilityBadge } from "@/components/ui/Badge";
import { createNoteAction, deleteNoteAction } from "@/lib/actions/notes";
import { addTagToEntity, removeTagFromEntity } from "@/lib/actions/tags";
import { uploadAttachment, deleteAttachment } from "@/lib/actions/attachments";
import { labelFor, RELATION_TYPES, type Reliability } from "@/lib/constants";

export async function DossierPanel({
  entityType,
  entityId,
}: {
  entityType: string;
  entityId: string;
}) {
  const context = await getDossierContext(entityType, entityId);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title="Tags" />
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {context.tags.length === 0 ? <p className="text-sm text-muted">Aucun tag.</p> : null}
            {context.tags.map((tag) => (
              <form key={tag.linkId} action={removeTagFromEntity}>
                <input type="hidden" name="linkId" value={tag.linkId} />
                <input type="hidden" name="entityType" value={entityType} />
                <input type="hidden" name="entityId" value={entityId} />
                <button type="submit" title="Retirer le tag">
                  <Badge tone="accent">#{tag.name} &times;</Badge>
                </button>
              </form>
            ))}
          </div>
          <form action={addTagToEntity} className="mt-3 flex gap-2">
            <input type="hidden" name="entityType" value={entityType} />
            <input type="hidden" name="entityId" value={entityId} />
            <input
              name="tagName"
              placeholder="#nouveau-tag"
              className="flex-1 rounded-md border border-border bg-panel-raised px-3 py-1.5 text-sm placeholder:text-muted/60 focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-md border border-accent/40 bg-accent-soft px-3 py-1.5 text-sm text-accent"
            >
              Ajouter
            </button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Relations" />
        <CardBody className="p-0">
          {context.relationships.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">Aucune relation enregistree.</p>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {context.relationships.map((rel) => (
                <li
                  key={`${rel.direction}-${rel.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                >
                  <span>
                    {rel.direction === "from" ? (
                      <>
                        {labelFor(RELATION_TYPES, rel.relationType as never)}{" "}
                        <Link
                          href={dossierPathFor(rel.otherType, rel.otherId)}
                          className="text-accent hover:underline"
                        >
                          {rel.otherLabel}
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href={dossierPathFor(rel.otherType, rel.otherId)}
                          className="text-accent hover:underline"
                        >
                          {rel.otherLabel}
                        </Link>{" "}
                        {labelFor(RELATION_TYPES, rel.relationType as never)} cette fiche
                      </>
                    )}
                  </span>
                  <ReliabilityBadge value={rel.reliability as Reliability} />
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-border-subtle px-5 py-3">
            <Link
              href={`/relations?from=${entityType}:${entityId}`}
              className="text-xs text-accent hover:underline"
            >
              + Ajouter une relation dans le graphe
            </Link>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Notes" />
        <CardBody>
          <form action={createNoteAction} className="flex flex-col gap-2">
            <input type="hidden" name="entityType" value={entityType} />
            <input type="hidden" name="entityId" value={entityId} />
            <input type="hidden" name="visibility" value="PRIVATE" />
            <textarea
              name="content"
              required
              placeholder="Ajouter une note..."
              className="min-h-16 rounded-md border border-border bg-panel-raised px-3 py-2 text-sm placeholder:text-muted/60 focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              className="self-end rounded-md border border-accent/40 bg-accent-soft px-3 py-1.5 text-sm text-accent"
            >
              Ajouter la note
            </button>
          </form>
          <ul className="mt-4 flex flex-col gap-3">
            {context.notes.length === 0 ? <p className="text-sm text-muted">Aucune note.</p> : null}
            {context.notes.map((note) => (
              <li
                key={note.id}
                className="rounded-md border border-border-subtle bg-panel-raised p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="whitespace-pre-wrap text-foreground">{note.content}</p>
                  <form action={deleteNoteAction}>
                    <input type="hidden" name="id" value={note.id} />
                    <button type="submit" className="text-xs text-muted hover:text-reliability-contradictory">
                      supprimer
                    </button>
                  </form>
                </div>
                <p className="mt-2 text-xs text-muted">{note.createdAt.toLocaleString("fr-FR")}</p>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Pieces jointes" subtitle="Photos, captures, preuves (8 Mo max)" />
        <CardBody>
          <form action={uploadAttachment} className="flex flex-col gap-2 sm:flex-row">
            <input type="hidden" name="entityType" value={entityType} />
            <input type="hidden" name="entityId" value={entityId} />
            <input
              type="file"
              name="file"
              accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
              required
              className="flex-1 text-sm text-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-panel-raised file:px-3 file:py-1.5 file:text-sm file:text-foreground"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md border border-accent/40 bg-accent-soft px-3 py-1.5 text-sm text-accent"
            >
              Envoyer
            </button>
          </form>
          <ul className="mt-4 flex flex-col gap-2">
            {context.attachments.length === 0 ? (
              <p className="text-sm text-muted">Aucune piece jointe.</p>
            ) : null}
            {context.attachments.map((attachment) => (
              <li
                key={attachment.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-panel-raised px-3 py-2 text-sm"
              >
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-accent hover:underline"
                >
                  {attachment.filename || "Fichier"}
                </a>
                <form action={deleteAttachment}>
                  <input type="hidden" name="id" value={attachment.id} />
                  <button type="submit" className="text-xs text-muted hover:text-reliability-contradictory">
                    supprimer
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Historique" />
        <CardBody className="p-0">
          {context.activity.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">Aucune modification enregistree.</p>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {context.activity.map((entry) => (
                <li key={entry.id} className="px-5 py-3 text-xs text-muted">
                  <span className="text-foreground">{entry.action}</span>
                  {entry.field ? ` — ${entry.field} : ${entry.oldValue ?? "-"} -> ${entry.newValue ?? "-"}` : ""}
                  <span className="float-right">{entry.createdAt.toLocaleString("fr-FR")}</span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
