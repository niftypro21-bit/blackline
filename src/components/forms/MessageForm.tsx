"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { sendMessage } from "@/lib/actions/messages";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function MessageForm({ channelId }: { channelId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const action = sendMessage.bind(null, channelId);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
        router.refresh();
      }}
      className="flex items-end gap-2 border-t border-border-subtle px-5 py-4"
    >
      <Textarea
        name="content"
        required
        placeholder="Ecrire un message..."
        className="min-h-14 flex-1"
      />
      <Button type="submit" variant="primary">
        Envoyer
      </Button>
    </form>
  );
}
