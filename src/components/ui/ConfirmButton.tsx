"use client";

import { Button } from "@/components/ui/Button";

export function ConfirmButton({
  children,
  confirmMessage,
}: {
  children: React.ReactNode;
  confirmMessage: string;
}) {
  return (
    <Button
      type="submit"
      variant="danger"
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </Button>
  );
}
