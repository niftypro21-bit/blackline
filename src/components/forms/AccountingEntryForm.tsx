import { createAccountingEntry } from "@/lib/actions/accounting";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ACCOUNTING_ENTRY_TYPES } from "@/lib/constants";

export function AccountingEntryForm() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={createAccountingEntry} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Type" htmlFor="type">
          <Select id="type" name="type" defaultValue="RECETTE">
            {ACCOUNTING_ENTRY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Montant fictif" htmlFor="amount">
          <Input id="amount" name="amount" type="number" min={0} required />
        </Field>
      </div>
      <Field label="Libelle" htmlFor="label">
        <Input id="label" name="label" type="text" required />
      </Field>
      <Field label="Date" htmlFor="date">
        <Input id="date" name="date" type="date" defaultValue={today} required />
      </Field>
      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" />
      </Field>
      <Button type="submit" variant="primary" className="justify-center">
        Ajouter l&apos;entree
      </Button>
    </form>
  );
}
