"use server";

import { postForm, postJoin, type FormState } from "../../lib/forms";
import { getSession } from "../../lib/auth";

export async function sendJoin(_prev: FormState, form: FormData) {
  return postJoin(form);
}

// The page is gated too, but the action is callable on its own, so it checks again.
export async function sendJob(_prev: FormState, form: FormData): Promise<FormState> {
  if (!(await getSession())?.member) return { error: "פרסום בלוח הדרושים פתוח לחברי הקהילה בלבד. התחברו או הצטרפו לקהילה." };
  return postForm("job", form);
}

export async function sendCollab(_prev: FormState, form: FormData) {
  return postForm("collab", form);
}

export async function sendNadlanist(_prev: FormState, form: FormData) {
  return postForm("nadlanist", form);
}

export async function sendContact(_prev: FormState, form: FormData) {
  return postForm("contact", form);
}

/** The homepage "הרשמה לקהילה" form: same route, marked so the manager's email says where it came from. */
export async function sendHomeContact(_prev: FormState, form: FormData) {
  form.set("source", "home");
  return postForm("contact", form);
}

export async function sendRecap(_prev: FormState, form: FormData) {
  return postForm("recap", form);
}
