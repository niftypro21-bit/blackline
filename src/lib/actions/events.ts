"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireEditableSession } from "@/lib/session";
import { logCreate, logChanges, logAction } from "@/lib/activity";
import { EVENT_CATEGORIES, VISIBILITIES } from "@/lib/constants";
import { emptyToNull } from "@/lib/form";

const categoryValues = EVENT_CATEGORIES.map((c) => c.value) as [string, ...string[]];
const visibilityValues = VISIBILITIES.map((v) => v.value) as [string, ...string[]];

const eventSchema = z.object({
  title: z.string().trim().min(1, "Titre requis"),
  category: z.enum(categoryValues),
  startAt: z.string().min(1, "Date requise").transform((value) => new Date(value)),
  endAt: z
    .string()
    .nullable()
    .transform((value) => (value ? new Date(value) : null)),
  locationId: z.string().trim().nullable(),
  description: z.string().trim().nullable(),
  visibility: z.enum(visibilityValues),
});

function parseEventForm(formData: FormData) {
  return eventSchema.parse({
    title: formData.get("title"),
    category: formData.get("category") || "APPOINTMENT",
    startAt: formData.get("startAt"),
    endAt: emptyToNull(formData.get("endAt")),
    locationId: emptyToNull(formData.get("locationId")),
    description: emptyToNull(formData.get("description")),
    visibility: formData.get("visibility") || "PRIVATE",
  });
}

async function syncParticipants(eventId: string, formData: FormData) {
  const personIds = [...new Set(formData.getAll("participantIds").map(String).filter(Boolean))];
  await prisma.eventParticipant.deleteMany({ where: { eventId } });
  if (personIds.length > 0) {
    await prisma.eventParticipant.createMany({
      data: personIds.map((personId) => ({ eventId, personId })),
    });
  }
}

export async function createEvent(formData: FormData) {
  await requireEditableSession();
  const data = parseEventForm(formData);
  const event = await prisma.event.create({ data });
  await syncParticipants(event.id, formData);
  await logCreate("EVENT", event.id, event.title);
  revalidatePath("/agenda");
  redirect("/agenda");
}

export async function updateEvent(id: string, formData: FormData) {
  await requireEditableSession();
  const data = parseEventForm(formData);
  const before = await prisma.event.findUniqueOrThrow({ where: { id } });
  const event = await prisma.event.update({ where: { id }, data });
  await syncParticipants(id, formData);
  await logChanges("EVENT", id, before, event);
  revalidatePath("/agenda");
  redirect("/agenda");
}

export async function toggleEventDone(formData: FormData) {
  await requireEditableSession();
  const id = formData.get("id") as string;
  const wasDone = formData.get("done") === "true";
  await prisma.event.update({ where: { id }, data: { done: !wasDone } });
  revalidatePath("/agenda");
}

export async function deleteEvent(formData: FormData) {
  await requireEditableSession();
  const id = formData.get("id") as string;
  await prisma.event.delete({ where: { id } });
  await logAction("DELETE", "EVENT", id);
  revalidatePath("/agenda");
}
