import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/seo";
import { getCollabs } from "./collaborations/wp";
import { getCommunities } from "./communities/wp";
import { getEvents } from "./events/wp";
import { eventHref } from "./events/data";
import { getJobs } from "./jobs/wp";
import { getNadlanistim } from "./nadlanistim/wp";
import { getEpisodes } from "./podcast/wp";
import { getArticles } from "./post-archive/wp";
import { getYouth } from "./youth/wp";

// Public pages only: account, checkout and the "new ..." forms stay out. Built from WordPress, so a
// post published there shows up here once the "wp" cache tag is cleared.
const STATIC = [
  "/", "/events", "/collaborations", "/communities", "/nadlanistim", "/jobs", "/podcast", "/post-archive",
  "/youth", "/join", "/contact", "/terms", "/privacy", "/accessibility",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [collabs, communities, events, jobs, people, episodes, articles, youth] = await Promise.all([
    getCollabs(), getCommunities(), getEvents(), getJobs(), getNadlanistim(), getEpisodes(), getArticles(), getYouth(),
  ]);
  const paths = [
    ...STATIC,
    ...collabs.map((c) => `/collaboration/${c.slug}`),
    ...communities.map((c) => `/community/${c.slug}`),
    ...events.map(eventHref),
    ...jobs.map((j) => `/job/${j.id}`),
    ...people.map((p) => `/nadlanist/${p.slug}`),
    ...episodes.map((e) => `/podcast/${e.slug}`),
    ...articles.map((a) => `/article/${a.slug}`),
    ...youth.map((y) => `/youth/${y.slug}`),
  ];
  // URL() encodes the Hebrew slugs and leaves the already-encoded event query alone.
  return paths.map((p) => ({ url: new URL(p, SITE_URL).href }));
}
