"use client";

import { usePathname } from "next/navigation";

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
  "/job-new": { label: "פרסום בלוח הדרושים", parent: "/jobs" },
  "/collaborations": { label: "שיתופי פעולה" },
  "/collaborations-locked": { label: "שיתופי פעולה" },
  "/collaboration-new": { label: "פרסום שיתוף פעולה", parent: "/collaborations" },
  "/nadlanistim": { label: "הכר את הנדלניסט" },
  "/nadlanist-new": { label: "הצטרפות למדריך", parent: "/nadlanistim" },
  "/communities": { label: "קהילות" },
  "/podcast": { label: "פודקאסט" },
  "/youth": { label: "נבחרת הצעירים" },
  "/contact": { label: "צור קשר" },
  "/join": { label: "הצטרפות לקהילה" },
  "/account": { label: "האזור האישי" },
  "/my-account": { label: "החשבון שלי", parent: "/account" },
  "/checkout": { label: "תשלום" },
  "/thank-you": { label: "תודה" },
  "/login": { label: "כניסה לחברים" },
  "/register": { label: "פתיחת חשבון", parent: "/login" },
  "/forgot-password": { label: "איפוס סיסמה", parent: "/login" },
};

// Detail pages: /<section>/<slug> -> its list page. The item's name comes from WordPress via the page (SiteShell `crumb`).
const DETAIL_PARENT: Record<string, string> = {
  collaboration: "/collaborations",
  nadlanist: "/nadlanistim",
  community: "/communities",
  podcast: "/podcast",
  youth: "/youth",
  job: "/jobs",
  article: "/post-archive",
};

function trail(path: string, label?: string): { href: string; label: string }[] {
  const [, section, slug] = path.split("/");
  const parent = slug ? DETAIL_PARENT[section] : undefined;
  const page = PAGES[path];
  // A page fed from WordPress passes its own name (SiteShell `crumb`), which wins over the static label.
  const current = parent ? { label: label ?? "", parent } : page && { ...page, label: label ?? page.label };
  if (!current?.label) return [];
  const up = current.parent ? trail(current.parent) : [];
  return [...up, { href: path, label: current.label }];
}

export default function Breadcrumbs({ current }: { current?: string }) {
  const path = usePathname() ?? "";
  const items = trail(path, current);
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
