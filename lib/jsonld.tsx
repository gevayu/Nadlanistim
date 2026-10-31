// schema.org JSON-LD for Google's rich results: the organization on the home page, events, job offers and articles.
// Built only from what the page already shows. Check a page at https://search.google.com/test/rich-results
import type { EventItem } from "@/app/events/data";
import type { Job } from "@/app/jobs/data";
import type { Article } from "@/app/post-archive/data";
import { SITE_NAME, SITE_URL } from "./seo";

type Data = Record<string, unknown>;

const ORG: Data = { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/v6-assets/logo.png` };
const fullUrl = (src?: string) => (src && /^https?:\/\//.test(src) ? src : undefined);
const plain = (text: string) => text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

/** `<` is escaped so text from WordPress can never close the script tag. */
export function JsonLd({ data }: { data: Data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c") }} />;
}

export const homeLd = (): Data => ({ "@graph": [{ ...ORG }, { "@type": "WebSite", name: SITE_NAME, url: SITE_URL, inLanguage: "he-IL" }] });

/** Upcoming events only (past ones are recaps). The date stays a date: WordPress gives the hour as free text. */
export const eventLd = (ev: EventItem, url: string): Data => ({
  "@type": "Event",
  name: ev.title,
  startDate: ev.date,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: { "@type": "Place", name: ev.place || SITE_NAME, address: { "@type": "PostalAddress", addressLocality: ev.place || undefined, addressCountry: "IL" } },
  description: ev.desc || undefined,
  image: fullUrl(ev.img),
  organizer: { ...ORG },
  url: `${SITE_URL}${url}`,
});

const EMPLOYMENT: Record<string, string> = { "משרה מלאה": "FULL_TIME", "משרה חלקית": "PART_TIME", "פרילנס": "CONTRACTOR", "התנדבות": "VOLUNTEER" };

/** A job offer. Someone looking for work is not a JobPosting, so "seek" listings get none (null). */
export function jobLd(job: Job): Data | null {
  if (job.kind === "seek") return null;
  const [d, m, y] = job.date.split(".");
  const remote = job.place === "מרחוק";
  return {
    "@type": "JobPosting",
    title: job.title,
    description: job.desc.split(/\n+/).filter(Boolean).map((p) => `<p>${p}</p>`).join("") || job.title,
    datePosted: y && m && d ? `${y}-${m}-${d}` : undefined,
    employmentType: EMPLOYMENT[job.type],
    hiringOrganization: { "@type": "Organization", name: job.company || job.by || SITE_NAME, logo: fullUrl(job.img) },
    ...(remote
      ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "IL" } }
      : { jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressRegion: job.place || undefined, addressCountry: "IL" } } }),
    directApply: false,
  };
}

export const articleLd = (a: Article): Data => ({
  "@type": "Article",
  headline: plain(a.title).slice(0, 110),
  description: a.excerpt || undefined,
  image: fullUrl(a.img),
  datePublished: a.published,
  author: a.author.name ? { "@type": "Person", name: a.author.name } : { ...ORG },
  publisher: { ...ORG },
  mainEntityOfPage: `${SITE_URL}/article/${encodeURIComponent(a.slug)}`,
});
