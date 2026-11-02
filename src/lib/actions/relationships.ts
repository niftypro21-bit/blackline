"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditableSession } from "@/lib/session";
import { logCreate, logAction } from "@/lib/activity";
import { RELATION_ENTITY_TYPES, RELATION_TYPES, RELIABILITIES, VISIBILITIES } from "@/lib/constants";
import { dossierPathFor } from "@/lib/dossier";

const entityTypeValues = RELATION_ENTITY_TYPES.map((t) => t.value) as [string, ...string[]];
const relationTypeValues = RELATION_TYPES.map((t) => t.value) as [string, ...string[]];
const reliabilityValues = RELIABILITIES.map((r) => r.value) as [string, ...string[]];
const visibilityValues = VISIBILITIES.map((v) => v.value) as [string, ...string[]];

const relationshipSchema = z.object({
  fromType: z.enum(entityTypeValues),
  fromId: z.string().min(1, "Origine requise"),
  toType: z.enum(entityTypeValues),
  toId: z.string().min(1, "Destination requise"),
  relationType: z.enum(relationTypeValues),
  label: z.string().trim().optional(),
  reliability: z.enum(reliabilityValues),
  notes: z.string().trim().optional(),
  visibility: z.enum(visibilityValues),
});

function orUndefined(value: FormDataEntryValue | null) {
  const str = (value as string) ?? "";
  return str.trim() === "" ? undefined : str;
}

function splitEntityRef(ref: FormDataEntryValue | null) {
  const str = (ref as string) ?? "";
  const [type, id] = str.split(":");
  return { type, id };
}

export async function createRelationship(formData: FormData) {
  await requireEditableSession();
  const from = splitEntityRef(formData.get("from"));
  const to = splitEntityRef(formData.get("to"));

  const data = relationshipSchema.parse({
    fromType: from.type,
    fromId: from.id,
    toType: to.type,
    toId: to.id,
    relationType: formData.get("relationType"),
    label: orUndefined(formData.get("label")),
    reliability: formData.get("reliability") || "UNVERIFIED",
    notes: orUndefined(formData.get("notes")),
    visibility: formData.get("visibility") || "PRIVATE",
  });

  const relationship = await prisma.relationship.create({ data });
  await logCreate(
    "RELATIONSHIP",
    relationship.id,
    `${data.fromType}:${data.fromId} -> ${data.toType}:${data.toId}`,
  );

  revalidatePath("/relations");
  revalidatePath(dossierPathFor(data.fromType, data.fromId));
  revalidatePath(dossierPathFor(data.toType, data.toId));
}

export async function deleteRelationship(formData: FormData) {
  await requireEditableSession();
  const id = formData.get("id") as string;
  const relationship = await prisma.relationship.delete({ where: { id } });
  await logAction("DELETE", "RELATIONSHIP", id);
  revalidatePath("/relations");
  revalidatePath(dossierPathFor(relationship.fromType, relationship.fromId));
  revalidatePath(dossierPathFor(relationship.toType, relationship.toId));
}
