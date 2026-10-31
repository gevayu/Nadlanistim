"use server";

import { postForm, postJoin, type FormState } from "../../lib/forms";
import { isLocked } from "../../lib/paywall";

export async function sendJoin(_prev: FormState, form: FormData) {
  return postJoin(form);
}

// The pages are gated too, but an action is callable on its own, so each checks "חומת תשלום" again.
export async function sendJob(_prev: FormState, form: FormData): Promise<FormState> {
  if (await isLocked("jobNew")) return { error: "פרסום בלוח הדרושים פתוח לחברי הקהילה בלבד. התחברו או הצטרפו לקהילה." };
  return postForm("job", form);
}

export async function sendCollab(_prev: FormState, form: FormData): Promise<FormState> {
  if (await isLocked("collabNew")) return { error: "פרסום שיתוף פעולה פתוח לחברי הקהילה בלבד. התחברו או הצטרפו לקהילה." };
  return postForm("collab", form);
}

export async function sendNadlanist(_prev: FormState, form: FormData): Promise<FormState> {
  if (await isLocked("nadlanistNew")) return { error: "ההצטרפות למדריך פתוחה לחברי הקהילה בלבד. התחברו או הצטרפו לקהילה." };
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
