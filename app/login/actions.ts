"use server";

import { redirect } from "next/navigation";
import { authApi, endSession, safeNext, startSession } from "../../lib/auth";

export type AuthFormState = {
  error?: string;
  /** Forgot-password: the request went through (shown whether or not the email has an account). */
  sent?: boolean;
  /** What the visitor typed (never the password), so a failed submit doesn't wipe the form. */
  values?: { email?: string; name?: string };
};

type TokenReply = { token: string; expires: number };

const field = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export async function login(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const email = field(form, "email");
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "צריך אימייל וסיסמה.", values: { email } };

  const res = await authApi<TokenReply>("login", { method: "POST", body: { email, password } });
  if (!res.ok) return { error: res.error, values: { email } };
  await startSession(res.data.token, res.data.expires);
  redirect(safeNext(form.get("next")));
}

export async function register(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const values = { email: field(form, "email"), name: field(form, "name") };
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { error: "הסיסמה צריכה להיות באורך 8 תווים לפחות.", values };

  const res = await authApi<TokenReply>("register", { method: "POST", body: { ...values, password } });
  if (!res.ok) return { error: res.error, values };
  await startSession(res.data.token, res.data.expires);
  redirect("/account");
}

export async function forgotPassword(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const email = field(form, "email");
  const res = await authApi<{ ok: boolean }>("forgot", { method: "POST", body: { email } });
  // Only a real failure (server down, too many tries) shows; "no such email" looks exactly like success.
  return res.ok ? { sent: true, values: { email } } : { error: res.error, values: { email } };
}

export async function logout() {
  await endSession();
  redirect("/");
}
