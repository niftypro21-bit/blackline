"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireEditableSession } from "@/lib/session";
import { logCreate, logChanges } from "@/lib/activity";
import { emptyToNull } from "@/lib/form";

const journalSchema = z.object({
  date: z.string().min(1, "Date requise").transform((value) => new Date(value)),
  mood: z.string().trim().nullable(),
  content: z.string().trim().min(1, "Contenu requis"),
  thingsLearned: z.string().trim().nullable(),
  thingsToVerify: z.string().trim().nullable(),
});

function parseJournalForm(formData: FormData) {
  return journalSchema.parse({
    date: formData.get("date"),
    mood: emptyToNull(formData.get("mood")),
    content: formData.get("content"),
    thingsLearned: emptyToNull(formData.get("thingsLearned")),
    thingsToVerify: emptyToNull(formData.get("thingsToVerify")),
  });
}

async function syncPeopleMet(journalEntryId: string, formData: FormData) {
  const personIds = [...new Set(formData.getAll("peopleMetIds").map(String).filter(Boolean))];
  await prisma.journalEntryPerson.deleteMany({ where: { journalEntryId } });
  if (personIds.length > 0) {
    await prisma.journalEntryPerson.createMany({
      data: personIds.map((personId) => ({ journalEntryId, personId })),
    });
  }
}

async function createTasksFromText(journalEntryId: string, text: string | null) {
  if (!text) return;
  const titles = text.split("\n").map((line) => line.trim()).filter(Boolean);
  if (titles.length === 0) return;
  await prisma.task.createMany({ data: titles.map((title) => ({ title, journalEntryId })) });
}

export async function createJournalEntry(formData: FormData) {
  await requireEditableSession();
  const data = parseJournalForm(formData);
  const entry = await prisma.journalEntry.create({ data });
  await syncPeopleMet(entry.id, formData);
  await createTasksFromText(entry.id, emptyToNull(formData.get("thingsToDo")));
  await logCreate("JOURNAL_ENTRY", entry.id, entry.content.slice(0, 60));
  revalidatePath("/journal");
  redirect(`/journal/${entry.id}`);
}

export async function updateJournalEntry(id: string, formData: FormData) {
  await requireEditableSession();
  const data = parseJournalForm(formData);
  const before = await prisma.journalEntry.findUniqueOrThrow({ where: { id } });
  const entry = await prisma.journalEntry.update({ where: { id }, data });
  await syncPeopleMet(id, formData);
  await createTasksFromText(id, emptyToNull(formData.get("thingsToDo")));
  await logChanges("JOURNAL_ENTRY", id, before, entry);
  revalidatePath("/journal");
  revalidatePath(`/journal/${id}`);
  redirect(`/journal/${id}`);
}

export async function toggleTask(formData: FormData) {
  await requireEditableSession();
  const id = formData.get("id") as string;
  const wasDone = formData.get("done") === "true";
  const task = await prisma.task.update({ where: { id }, data: { done: !wasDone } });
  revalidatePath("/journal");
  revalidatePath("/agenda");
  if (task.journalEntryId) revalidatePath(`/journal/${task.journalEntryId}`);
}
