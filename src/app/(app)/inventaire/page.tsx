import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isOwner } from "@/lib/permissions";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { CatalogItemForm } from "@/components/forms/CatalogItemForm";
import { MarcheNoirCart } from "@/components/forms/MarcheNoirCart";
import { setCatalogItemArchived } from "@/lib/actions/catalog";

export default async function MarcheNoirPage() {
  const session = await auth();
  const user = session!.user;
  const owner = isOwner(user.role);

  const items = await prisma.catalogItem.findMany({
    where: owner ? {} : { archived: false },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Marche noir</h1>
        <p className="mt-1 text-sm text-muted">
          Stock et prix fictifs pour le jeu de role. Accessible a tous les membres.
        </p>
      </div>

      {owner ? (
        <Card>
          <CardHeader title="Ajouter un article" />
          <CardBody>
            <CatalogItemForm />
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Catalogue" />
        <CardBody className="p-0">
          {items.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Aucun article" />
            </div>
          ) : owner ? (
            <ul className="divide-y divide-border-subtle">
              {items.map((item) => (
                <li key={item.id} className="px-5 py-4">
                  <div>
                    <p className="text-sm text-foreground">
                      {item.name}
                      {item.archived ? <span className="ml-2 text-xs text-muted">(archive)</span> : null}
                    </p>
                    {item.description ? <p className="mt-1 text-sm text-muted">{item.description}</p> : null}
                    <p className="mt-1 text-xs text-muted">
                      Prix : {item.price} — Stock : {item.quantity}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-col gap-3">
                    <details>
                      <summary className="cursor-pointer text-xs text-accent">Modifier</summary>
                      <div className="mt-3">
                        <CatalogItemForm item={item} />
                      </div>
                    </details>
                    <form action={setCatalogItemArchived.bind(null, item.id, !item.archived)}>
                      <Button type="submit" variant="ghost">
                        {item.archived ? "Reactiver" : "Archiver"}
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-4">
              <MarcheNoirCart items={items} />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
