"use client";

import { useActionState } from "react";
import { createReservation } from "@/lib/actions/orders";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function ReservationForm({ catalogItemId, maxQuantity }: { catalogItemId: string; maxQuantity: number }) {
  const [error, formAction, pending] = useActionState(createReservation, undefined);

  if (maxQuantity <= 0) {
    return <p className="text-xs text-status-refused">Rupture de stock</p>;
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="catalogItemId" value={catalogItemId} />
      <Input
        name="quantity"
        type="number"
        min={1}
        max={maxQuantity}
        defaultValue={1}
        required
        className="w-20"
      />
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "..." : "Reserver"}
      </Button>
      {error ? <p className="text-xs text-status-refused">{error}</p> : null}
    </form>
  );
}
