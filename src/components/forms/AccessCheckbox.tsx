"use client";

import { useState, useTransition } from "react";

export function AccessCheckbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: (next: boolean) => Promise<void>;
}) {
  const [isChecked, setIsChecked] = useState(checked);
  const [pending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      checked={isChecked}
      disabled={pending}
      onChange={(event) => {
        const next = event.target.checked;
        setIsChecked(next);
        startTransition(async () => {
          await onToggle(next);
        });
      }}
      className="h-4 w-4 accent-[var(--accent)]"
    />
  );
}
