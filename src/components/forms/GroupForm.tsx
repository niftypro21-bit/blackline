import { createGroup, updateGroup } from "@/lib/actions/groups";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function GroupForm({
  group,
}: {
  group?: { id: string; name: string; description: string | null };
}) {
  const action = group ? updateGroup.bind(null, group.id) : createGroup;

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Nom" htmlFor="name">
        <Input id="name" name="name" type="text" defaultValue={group?.name} required />
      </Field>
      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={group?.description ?? ""} />
      </Field>
      <Button type="submit" variant="primary" className="justify-center">
        {group ? "Enregistrer" : "Creer le groupe"}
      </Button>
    </form>
  );
}
