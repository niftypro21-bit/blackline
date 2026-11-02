import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Button, LinkButton } from "@/components/ui/Button";
import { personDisplayName } from "@/lib/format";
import type { MCMember } from "@/generated/prisma/client";

function toDateInput(date?: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function McMemberForm({
  action,
  mcMember,
  persons,
  personId,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  mcMember?: MCMember | null;
  persons: { id: string; firstName: string; lastName: string | null; nickname: string | null }[];
  personId: string;
  cancelHref: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Grade" htmlFor="grade">
          <Input
            id="grade"
            name="grade"
            defaultValue={mcMember?.grade ?? ""}
            placeholder="Prospect, Membre, Officier, President..."
          />
        </Field>
        <Field label="Date d'entree" htmlFor="joinDate">
          <Input id="joinDate" name="joinDate" type="date" defaultValue={toDateInput(mcMember?.joinDate)} />
        </Field>
        <Field label="Parrain / repondant" htmlFor="sponsorId">
          <Select id="sponsorId" name="sponsorId" defaultValue={mcMember?.sponsorId ?? ""}>
            <option value="">Aucun</option>
            {persons
              .filter((p) => p.id !== personId)
              .map((person) => (
                <option key={person.id} value={person.id}>
                  {personDisplayName(person)}
                </option>
              ))}
          </Select>
        </Field>
        <Field label="Statut patch" htmlFor="patchStatus">
          <Input id="patchStatus" name="patchStatus" defaultValue={mcMember?.patchStatus ?? ""} />
        </Field>
      </div>

      <Field label="Notes personnelles" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={mcMember?.notes ?? ""} />
      </Field>

      <div className="flex justify-end gap-3">
        <LinkButton href={cancelHref}>Annuler</LinkButton>
        <Button type="submit" variant="primary">
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
