import { getFavorites, setFavorite } from "../../../lib/favorites";

// The heart in the site header and the list in /account are client components; they read and save here.
export async function GET() {
  return Response.json({ items: await getFavorites() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const res = await setFavorite(String(body?.path ?? ""), String(body?.title ?? ""), Boolean(body?.on));
  return res.ok ? Response.json(res.data) : Response.json({ error: res.error }, { status: res.status || 502 });
}
