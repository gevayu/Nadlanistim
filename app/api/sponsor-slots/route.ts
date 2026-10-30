import { getSponsorSlots } from "../../v6/sponsors";

// The sponsor strips sit inside client components (SiteShell, EventsBoard), so they read their slots here.
// The WordPress fetch is cached under the "wp" tag and expires with /api/revalidate like every other section.
export async function GET() {
  try {
    return Response.json(await getSponsorSlots());
  } catch (e) {
    console.error("sponsor-slots:", e);
    return Response.json({ top: null, events: null }, { status: 502 });
  }
}
