import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type Action = "CREATE" | "UPDATE" | "DELETE" | "ARCHIVE" | "RESTORE";

async function currentUserId(): Promise<string | undefined> {
  const session = await auth();
  return session?.user?.id;
}

export async function logCreate(entityType: string, entityId: string, summary?: string | null) {
  const userId = await currentUserId();
  await prisma.activityLog.create({
    data: { userId, action: "CREATE", entityType, entityId, newValue: summary ?? null },
  });
}

const IGNORED_FIELDS = new Set(["id", "createdAt", "updatedAt"]);

// Compare deux versions d'une entite et enregistre une ligne d'historique par champ modifie.
export async function logChanges(
  entityType: string,
  entityId: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
) {
  const userId = await currentUserId();
  const fields = Object.keys(after).filter(
    (key) => !IGNORED_FIELDS.has(key) && String(before[key] ?? "") !== String(after[key] ?? ""),
  );
  if (fields.length === 0) return;

  await prisma.activityLog.createMany({
    data: fields.map((field) => ({
      userId,
      action: "UPDATE" as Action,
      entityType,
      entityId,
      field,
      oldValue: before[field] == null ? null : String(before[field]),
      newValue: after[field] == null ? null : String(after[field]),
    })),
  });
}

export async function logAction(action: Action, entityType: string, entityId: string) {
  const userId = await currentUserId();
  await prisma.activityLog.create({ data: { userId, action, entityType, entityId } });
}
