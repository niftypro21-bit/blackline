import { createCatalogItem, updateCatalogItem } from "@/lib/actions/catalog";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function CatalogItemForm({
  item,
}: {
  item?: { id: string; name: string; description: string | null; price: number; quantity: number };
}) {
  const action = item ? updateCatalogItem.bind(null, item.id) : createCatalogItem;

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Nom de l'article" htmlFor="name">
        <Input id="name" name="name" type="text" defaultValue={item?.name} required />
      </Field>
      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={item?.description ?? ""} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Prix fictif" htmlFor="price">
          <Input id="price" name="price" type="number" min={0} defaultValue={item?.price ?? 0} required />
        </Field>
        <Field label="Stock" htmlFor="quantity">
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min={0}
            defaultValue={item?.quantity ?? 0}
            required
          />
        </Field>
      </div>
      <Button type="submit" variant="primary" className="justify-center">
        {item ? "Enregistrer" : "Ajouter au catalogue"}
      </Button>
    </form>
  );
}
