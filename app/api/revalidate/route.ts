import { revalidateTag } from "next/cache";
import { WP_TAG } from "../../../lib/wp";

// Called by the WordPress backend whenever content is saved, so the site shows it on the next visit.
// The shared secret lives in REVALIDATE_SECRET here and NADLANISTIM_REVALIDATE_SECRET in wp-config.
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag(WP_TAG, { expire: 0 });
  return Response.json({ ok: true });
}
