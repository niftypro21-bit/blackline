"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireOwnerSession } from "@/lib/session";
import { setDiscordWebhookUrl } from "@/lib/settings";
import { logAction } from "@/lib/activity";
import { emptyToNull } from "@/lib/form";

const webhookSchema = z.object({
  url: z.string().trim().url("URL invalide").nullable(),
});

export async function updateDiscordWebhook(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const session = await requireOwnerSession();

  const parsed = webhookSchema.safeParse({ url: emptyToNull(formData.get("url")) });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "URL invalide.";

  await setDiscordWebhookUrl(parsed.data.url);
  await logAction("UPDATE", "SETTINGS", session.user.id);

  revalidatePath("/administration/parametres");
}

export async function clearDiscordWebhook() {
  const session = await requireOwnerSession();
  await setDiscordWebhookUrl(null);
  await logAction("UPDATE", "SETTINGS", session.user.id);
  revalidatePath("/administration/parametres");
}
