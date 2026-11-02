import { requireOwnerSession } from "@/lib/session";
import { isDiscordWebhookConfigured } from "@/lib/settings";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { WebhookForm } from "@/components/forms/WebhookForm";

export default async function ParametresPage() {
  await requireOwnerSession();
  const configured = await isDiscordWebhookConfigured();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Parametres</h1>
        <p className="mt-1 text-sm text-muted">Notifications Discord (optionnelles).</p>
      </div>

      <Card>
        <CardHeader
          title="Webhook Discord"
          subtitle="Envoie une notification lors d'une nouvelle commande, d'une decision ou d'un nouveau rendez-vous."
        />
        <CardBody>
          <WebhookForm configured={configured} />
        </CardBody>
      </Card>
    </div>
  );
}
