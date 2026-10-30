"use server";

import { revalidateTag } from "next/cache";
import { authApi, getToken } from "../../lib/auth";
import { WP_TAG } from "../../lib/wp";
import type { Nadlanist } from "../nadlanistim/data";

export type SaveResult =
  | { ok: true; status: string; slug: string; created: boolean }
  | { ok: false; error: string };

type ProfileReply = { ok: boolean; created: boolean; nadlanist: { id: number; slug: string; status: string } };

/**
 * Saves /my-account to the member's nadlanist post in WordPress (a new draft if they have none).
 * `newPhoto` is a data URL only when the member picked a new photo; WordPress stores it as the featured image.
 * The email is not sent: WordPress always writes the account's own email, which is what ties the post to the account.
 */
export async function saveProfile(form: Nadlanist, newPhoto?: string): Promise<SaveResult> {
  const token = await getToken();
  if (!token) return { ok: false, error: "צריך להתחבר מחדש." };

  const { name, role, field, place, quote, bio, phone, linkedin, instagram, openToWork, communities } = form;
  const res = await authApi<ProfileReply>("profile", {
    method: "POST",
    token,
    body: {
      name, role, field, place, quote, bio, phone, linkedin, instagram, openToWork, communities,
      photo: newPhoto?.startsWith("data:image/") ? newPhoto : undefined,
    },
  });
  if (!res.ok) return { ok: false, error: res.error };

  const { slug, status } = res.data.nadlanist;
  // WordPress pings /api/revalidate too; this makes sure the member's next page view already shows the edit.
  if (status === "publish") revalidateTag(WP_TAG, { expire: 0 });
  return { ok: true, status, slug, created: res.data.created };
}
