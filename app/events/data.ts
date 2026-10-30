export type FeatureIcon = "sparkles" | "target" | "deal" | "gift" | "food";
export type Quote = { q: string; by: string };

/** One FAQ line: the question, and the answer when WordPress has one ("" = question only). */
export type FaqItem = { q: string; a: string };

export type EventItem = {
  slug: string;
  title: string;
  types: string[]; // nad_event_type names
  img: string; // Unsplash photo id (local entries) or a full image URL (WordPress)
  date: string; // "2026-06-14"
  time: string;
  place: string;
  desc: string;
  cta: string; // registration link; "" means the site's join form
  accent: boolean;
  past: boolean;
  // /event
  price: string;
  audience: string;
  agenda: { time: string; what: string }[];
  features: { ic: FeatureIcon; t: string; d: string }[];
  speaker: { name: string; role: string; photo: string; bio: string; quote: string; link: string } | null;
  testimonials: Quote[];
  faq: FaqItem[];
  // /event-party
  dressCode: string;
  entry: string;
  vibe: string[];
  timeline: { time: string; t: string; s: string }[];
  lineup: { name: string; role: string; img: string }[];
  partyGallery: string[];
  partyQuotes: Quote[];
  partyFaq: FaqItem[];
  // /event-recap
  recapGallery: string[];
  takeaways: { t: string; d: string }[];
  video: string; // "" when there is no recording
  videoThumb: string;
  recapTestimonials: { q: string; name: string; role: string; img: string }[];
  downloads: { name: string; url: string }[];
};

type Route = "/event" | "/event-party" | "/event-recap";

// Same rule as the backend's "View" button: parties and galas get the party page, then past events the recap.
const PARTY_TYPES = ["מסיבה", "גאלה", "ערב גאלה"];
export const eventRoute = (e: EventItem): Route =>
  e.types.some((t) => PARTY_TYPES.includes(t)) ? "/event-party" : e.past ? "/event-recap" : "/event";
export const eventHref = (e: EventItem) => `${eventRoute(e)}?e=${encodeURIComponent(e.slug)}`;

export const isVolunteer = (e: EventItem) => e.types.includes("התנדבות");

const byDate = (a: EventItem, b: EventItem) => a.date.localeCompare(b.date);

/** The "next event" the site promotes: the upcoming accent event, else the soonest upcoming one. */
export function featuredEvent(all: EventItem[]): EventItem | undefined {
  const upcoming = all.filter((e) => !e.past && !isVolunteer(e)).sort(byDate);
  return upcoming.find((e) => e.accent) ?? upcoming[0];
}

/** The event a template page shows: `?e=<slug>` if it opens on this route, else the route's default. */
export function pickEvent(all: EventItem[], route: Route, slug?: string): EventItem | undefined {
  const mine = all.filter((e) => eventRoute(e) === route).sort(byDate);
  const hit = mine.find((e) => e.slug === slug);
  if (hit) return hit;
  if (route === "/event") return mine.find((e) => e.accent) ?? mine[0];
  if (route === "/event-party") return mine.find((e) => !e.past) ?? mine.at(-1);
  return mine.at(-1); // most recent past event
}

/** "2026-06-14" -> "14 ביוני 2026" (or "יום א׳, 14 ביוני 2026" with the weekday). */
export const heDate = (iso: string, weekday = false) =>
  iso
    ? new Intl.DateTimeFormat("he-IL", { weekday: weekday ? "short" : undefined, day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
        .format(new Date(iso))
    : "";

/** Headline split for the hero: "קרנות חוב פרטיות - A to Z" -> ["קרנות חוב פרטיות", "A to Z"]. */
export const splitTitle = (t: string): [string, string] => {
  const i = t.lastIndexOf(" - ");
  return i < 0 ? [t, ""] : [t.slice(0, i), t.slice(i + 3)];
};

/** "14 ביוני 2026 · אקספו תל אביב", skipping whichever part WordPress left empty. */
export const metaLine = (...parts: string[]) => parts.filter(Boolean).join(" · ");
