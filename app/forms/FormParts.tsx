"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import type { FormState } from "../../lib/forms";

/**
 * Runs a form's Server Action from onSubmit instead of the `action` prop: React resets a form after an
 * `action` submit, and a failed submit must keep what the visitor typed.
 */
export function useFormSend(action: (prev: FormState, form: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState(action, {});
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  };
  return { state, pending, onSubmit };
}

export function FormError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p
      role="alert"
      style={{
        margin: 0,
        padding: "14px 18px",
        borderRadius: "var(--r-sm)",
        background: "rgba(244,114,182,.1)",
        border: "1px solid rgba(244,114,182,.35)",
        color: "var(--ink)",
        fontSize: 14,
      }}
    >
      {error}
    </p>
  );
}

/** Spam trap: hidden from people and screen readers, filled by bots. WordPress answers it with a fake success. */
export function Honeypot() {
  return (
    <input
      type="text"
      name="website"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)", opacity: 0, pointerEvents: "none" }}
    />
  );
}
