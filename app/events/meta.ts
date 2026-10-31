import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { heDate } from "./data";
import { getEvent } from "./wp";

type Route = "/event" | "/event-party" | "/event-recap";

/**
 * generateMetadata for the single-event pages. They pick the event from `?e=<slug>`, which only a
 * page (not a layout) can read, so each page exports `generateMetadata = eventMetadata(route)`.
 */
export const eventMetadata =
  (route: Route) =>
  async ({ searchParams }: { searchParams: Promise<{ e?: string }> }): Promise<Metadata> => {
    const ev = await getEvent(route, (await searchParams).e);
    if (!ev) return { title: "האירוע לא נמצא" };
    const when = [heDate(ev.date), ev.place].filter(Boolean).join(", ");
    const title = route === "/event-recap" ? `${ev.title}, סיכום האירוע` : ev.title;
    const meta = pageMeta(title, [when, ev.desc].filter(Boolean).join(". ") || "אירוע של קהילת הנדלניסטים.", ev.img);
    // ./ would drop ?e=, and every event would claim the same address
    const url = `${route}?e=${encodeURIComponent(ev.slug)}`;
    return { ...meta, alternates: { canonical: url }, openGraph: { ...meta.openGraph, url } };
  };
