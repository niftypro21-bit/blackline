"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: (formData.get("callbackUrl") as string) || "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Email ou mot de passe incorrect.";
    }
    throw error;
  }
}
