"use client";

import { signOutAction } from "@/lib/actions/auth-actions";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOutAction()}
      className="mt-2 text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-foreground"
    >
      Se deconnecter
    </button>
  );
}
