"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireEditableSession } from "@/lib/session";
import { logCreate, logChanges } from "@/lib/activity";
import { RELIABILITIES, VISIBILITIES } from "@/lib/constants";
import { emptyToNull } from "@/lib/form";

const reliabilityValues = RELIABILITIES.map((r) => r.value) as [string, ...string[]];
const visibilityValues = VISIBILITIES.map((v) => v.value) as [string, ...string[]];

const observationSchema = z.object({
  occurredAt: z.string().min(1, "Date requise").transform((value) => new Date(value)),
  locationId: z.string().trim().nullable(),
  personId: z.string().trim().nullable(),
  vehicleId: z.string().trim().nullable(),
  description: z.string().trim().min(1, "Description requise"),
  evidenceUrl: z.string().trim().nullable(),
  reliability: z.enum(reliabilityValues),
  notes: z.string().trim().nullable(),
  visibility: z.enum(visibilityValues),
});

function parseObservationForm(formData: FormData) {
  return observationSchema.parse({
    occurredAt: formData.get("occurredAt"),
    locationId: emptyToNull(formData.get("locationId")),
    personId: emptyToNull(formData.get("personId")),
    vehicleId: emptyToNull(formData.get("vehicleId")),
    description: formData.get("description"),
    evidenceUrl: emptyToNull(formData.get("evidenceUrl")),
    reliability: formData.get("reliability") || "UNVERIFIED",
    notes: emptyToNull(formData.get("notes")),
    visibility: formData.get("visibility") || "PRIVATE",
  });
}

async function syncWitnesses(observationId: string, formData: FormData) {
  const witnessIds = [...new Set(formData.getAll("witnessIds").map(String).filter(Boolean))];
  await prisma.observationWitness.deleteMany({ where: { observationId } });
  if (witnessIds.length > 0) {
    await prisma.observationWitness.createMany({
      data: witnessIds.map((personId) => ({ observationId, personId })),
    });
  }
}

// Permet de creer une source a la volee depuis le formulaire d'observation
// plutot que d'exiger un aller-retour vers une page de gestion des sources.
async function resolveSourceId(formData: FormData): Promise<string | null> {
  const newSourceName = emptyToNull(formData.get("newSourceName"));
  if (!newSourceName) return emptyToNull(formData.get("sourceId"));

  const existing = await prisma.source.findFirst({ where: { name: newSourceName } });
  if (existing) return existing.id;

  const created = await prisma.source.create({ data: { name: newSourceName } });
  return created.id;
}

export async function createObservation(formData: FormData) {
  await requireEditableSession();
  const data = parseObservationForm(formData);
  const sourceId = await resolveSourceId(formData);
  const observation = await prisma.observation.create({ data: { ...data, sourceId } });
  await syncWitnesses(observation.id, formData);
  await logCreate("OBSERVATION", observation.id, observation.description.slice(0, 80));
  revalidatePath("/observations");
  redirect(`/observations/${observation.id}`);
}

export async function updateObservation(id: string, formData: FormData) {
  await requireEditableSession();
  const data = parseObservationForm(formData);
  const sourceId = await resolveSourceId(formData);
  const before = await prisma.observation.findUniqueOrThrow({ where: { id } });
  const observation = await prisma.observation.update({ where: { id }, data: { ...data, sourceId } });
  await syncWitnesses(id, formData);
  await logChanges("OBSERVATION", id, before, observation);
  revalidatePath("/observations");
  revalidatePath(`/observations/${id}`);
  redirect(`/observations/${id}`);
}

export async function listSourcesForSelect() {
  return prisma.source.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
}
