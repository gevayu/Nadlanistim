// A member's saved pages, kept on the WordPress account (wordpress/nadlanistim-auth.php, route auth/favorites).
import "server-only";
import { authApi, getToken } from "./auth";

export type Favorite = { path: string; title: string; at: string };

/** The signed-in member's favorites, newest first; [] when logged out or WordPress can't be reached. */
export async function getFavorites(): Promise<Favorite[]> {
  const token = await getToken();
  if (!token) return [];
  const res = await authApi<{ items: Favorite[] }>("favorites", { method: "GET", token });
  return res.ok && Array.isArray(res.data.items) ? res.data.items : [];
}

/** Adds (`on`) or removes one page; the list as WordPress has it afterwards. */
export async function setFavorite(path: string, title: string, on: boolean) {
  const token = await getToken();
  if (!token) return { ok: false as const, status: 401, error: "צריך להתחבר." };
  return authApi<{ items: Favorite[] }>("favorites", { method: "POST", token, body: { path, title, on } });
}
