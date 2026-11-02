import { getDiscordWebhookUrl } from "@/lib/settings";

// Notification best-effort : si aucun webhook n'est configure, ou si Discord est
// injoignable, le site continue de fonctionner normalement. L'URL du webhook n'est
// jamais incluse dans un message d'erreur ni dans une trace de log.
export async function notifyDiscord(message: string): Promise<void> {
  try {
    const url = await getDiscordWebhookUrl();
    if (!url) return;

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
  } catch {
    console.error("Notification Discord : envoi impossible (webhook injoignable ou invalide).");
  }
}
