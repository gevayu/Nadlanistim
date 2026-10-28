"use client";

import { usePathname } from "next/navigation";
import { getCollab } from "../collaborations/data";
import { getCommunity } from "../communities/data";
import { getJob } from "../jobs/data";
import { getNadlanist } from "../nadlanistim/data";
import { getEpisode } from "../podcast/data";
import { getMember } from "../youth/data";

type Crumb = { label: string; parent?: string };

// Every V6 inner page: its label and the page one level up (home is implied as the root).
const PAGES: Record<string, Crumb> = {
  "/post-archive": { label: "בית הידע" },
  "/post": { label: "מיסוי מקרקעין 2026", parent: "/post-archive" },
  "/events": { label: "אירועים" },
  "/event": { label: "מאסטרקלאס: קרנות חוב פרטיות", parent: "/events" },
  "/event-party": { label: "מסיבת הנדלניסטים", parent: "/events" },
  "/event-recap": { label: "כנס הנדלניסטים 2025", parent: "/events" },
  "/jobs": { label: "לוח דרושים" },
  "/jobs-locked": { label: "לוח דרושים" },
  "/job": { label: getJob(1001)?.title ?? "משרה", parent: "/jobs" },
  "/job-new": { label: "פרסום בלוח הדרושים", parent: "/jobs" },
  "/collaborations": { label: "שיתופי פעולה" },
  "/collaborations-locked": { label: "שיתופי פעולה" },
  "/collaboration-new": { label: "פרסום שיתוף פעולה", parent: "/collaborations" },
  "/nadlanistim": { label: "הכר את הנדלניסט" },
  "/nadlanist-new": { label: "הצטרפות למדריך", parent: "/nadlanistim" },
  "/profile": { label: "אבי כהן", parent: "/nadlanistim" },
  "/communities": { label: "קהילות" },
  "/podcast": { label: "פודקאסט" },
  "/youth": { label: "נבחרת הצעירים" },
  "/contact": { label: "צור קשר" },
  "/join": { label: "הצטרפות לקהילה" },
  "/account": { label: "האזור האישי" },
};

// Detail pages: /<section>/<slug> -> parent list page + the item's name from its data file.
const DETAIL: Record<string, { parent: string; name: (slug: string) => string | undefined }> = {
  collaboration: { parent: "/collaborations", name: (s) => getCollab(s)?.title },
  nadlanist: { parent: "/nadlanistim", name: (s) => getNadlanist(s)?.name },
  community: { parent: "/communities", name: (s) => getCommunity(s)?.name },
  podcast: { parent: "/podcast", name: (s) => getEpisode(s)?.title },
  youth: { parent: "/youth", name: (s) => getMember(s)?.name },
};

function trail(path: string): { href: string; label: string }[] {
  const [, section, slug] = path.split("/");
  const detail = slug ? DETAIL[section] : undefined;
  const current = detail ? { label: detail.name(slug) ?? "", parent: detail.parent } : PAGES[path];
  if (!current?.label) return [];
  const up = current.parent ? trail(current.parent) : [];
  return [...up, { href: path, label: current.label }];
}

export default function Breadcrumbs() {
  const path = usePathname() ?? "";
  const items = trail(path);
  if (!items.length) return null;

  return (
    <nav className="v6-container v6-crumbs" aria-label="פירורי לחם">
      <ol>
        <li><a href="/">דף הבית</a></li>
        {items.map((c, i) =>
          i === items.length - 1
            ? <li key={c.href} aria-current="page">{c.label}</li>
            : <li key={c.href}><a href={c.href}>{c.label}</a></li>
        )}
      </ol>
    </nav>
  );
}
