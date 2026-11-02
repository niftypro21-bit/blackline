import { createChannel, updateChannel } from "@/lib/actions/channels";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function ChannelForm({
  groups,
  channel,
}: {
  groups: { id: string; name: string }[];
  channel?: { id: string; groupId: string; name: string; description: string | null };
}) {
  const action = channel ? updateChannel.bind(null, channel.id) : createChannel;

  return (
    <form action={action} className="flex flex-col gap-4">
      {channel ? (
        <input type="hidden" name="groupId" value={channel.groupId} />
      ) : (
        <Field label="Groupe" htmlFor="groupId">
          <Select id="groupId" name="groupId" required defaultValue="">
            <option value="" disabled>
              Choisir un groupe
            </option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="Nom du salon" htmlFor="name">
        <Input id="name" name="name" type="text" defaultValue={channel?.name} required />
      </Field>
      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={channel?.description ?? ""} />
      </Field>
      <Button type="submit" variant="primary" className="justify-center">
        {channel ? "Enregistrer" : "Creer le salon"}
      </Button>
    </form>
  );
}
