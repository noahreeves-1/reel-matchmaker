"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

// AUTHENTICATION ACTIONS: Server actions for handling login/logout
// These functions handle form submissions and error management for auth flows

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (err) {
    if (err instanceof AuthError && err.type === "CredentialsSignin") {
      return "Invalid credentials.";
    }
    return "Something went wrong.";
  }
}
