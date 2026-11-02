import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

// Ne jamais renvoyer discordWebhookUrl a une Server Action appelee depuis le client /
// a un composant rendu cote navigateur. Utiliser uniquement isDiscordWebhookConfigured()
// pour l'affichage, et getDiscordWebhookUrl() depuis du code serveur pur (ex: discord.ts).

export async function getDiscordWebhookUrl(): Promise<string | null> {
  const settings = await prisma.settings.findUnique({ where: { id: SETTINGS_ID } });
  return settings?.discordWebhookUrl || process.env.DISCORD_WEBHOOK_URL || null;
}

export async function isDiscordWebhookConfigured(): Promise<boolean> {
  return (await getDiscordWebhookUrl()) !== null;
}

export async function setDiscordWebhookUrl(url: string | null): Promise<void> {
  await prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    update: { discordWebhookUrl: url },
    create: { id: SETTINGS_ID, discordWebhookUrl: url },
  });
}
