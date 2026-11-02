"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCartOrders } from "@/lib/actions/orders";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type CatalogItem = { id: string; name: string; price: number; quantity: number };

export function MarcheNoirCart({ items }: { items: CatalogItem[] }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const cartEntries = Object.entries(cart).filter(([, qty]) => qty > 0);
  const total = cartEntries.reduce((sum, [id, qty]) => {
    const item = items.find((i) => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  function addToCart(item: CatalogItem) {
    const qty = Math.max(1, Math.min(quantities[item.id] ?? 1, item.quantity));
    setCart((prev) => {
      const next = Math.min(item.quantity, (prev[item.id] ?? 0) + qty);
      return { ...prev, [item.id]: next };
    });
  }

  function removeFromCart(itemId: string) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }

  function checkout() {
    setError(undefined);
    const orderItems = cartEntries.map(([catalogItemId, quantity]) => ({ catalogItemId, quantity }));
    startTransition(async () => {
      const result = await createCartOrders(orderItems);
      if (result) {
        setError(result);
        return;
      }
      setCart({});
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="divide-y divide-border-subtle">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 py-3">
            <span className="text-sm text-foreground">
              {item.name} <span className="text-muted">— {item.price} / unite, stock {item.quantity}</span>
            </span>
            {item.quantity > 0 ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={item.quantity}
                  defaultValue={1}
                  onChange={(e) => setQuantities((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                  className="w-16"
                />
                <Button type="button" variant="ghost" onClick={() => addToCart(item)}>
                  Ajouter au panier
                </Button>
              </div>
            ) : (
              <span className="text-xs text-status-refused">Rupture de stock</span>
            )}
          </li>
        ))}
      </ul>

      {cartEntries.length > 0 ? (
        <div className="rounded-md border border-accent/30 bg-accent-soft p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted">Panier</p>
          <ul className="flex flex-col gap-1">
            {cartEntries.map(([id, qty]) => {
              const item = items.find((i) => i.id === id);
              return (
                <li key={id} className="flex items-center justify-between text-sm text-foreground">
                  <span>
                    {qty} x {item?.name}
                  </span>
                  <button type="button" onClick={() => removeFromCart(id)} className="text-xs text-muted hover:text-foreground">
                    Retirer
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-sm text-muted">Total : {total}</p>
          {error ? <p className="mt-2 text-sm text-status-refused">{error}</p> : null}
          <Button type="button" variant="primary" disabled={pending} onClick={checkout} className="mt-3 justify-center">
            {pending ? "Validation..." : "Valider la commande"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
