import HomePageV6, { type MemberCategory } from "./v6/HomeV6";
import { getCommunities } from "./communities/wp";
import { getEvents } from "./events/wp";
import { getJobs } from "./jobs/wp";
import { getNadlanistim } from "./nadlanistim/wp";
import { publicCard } from "./nadlanistim/data";
import { getYouth, getYouthSettings } from "./youth/wp";
import { getArticles } from "./post-archive/wp";
import { getEpisodes } from "./podcast/wp";
import { getHomeContent } from "./v6/wp";

// "חברי הקהילה": one card per professional field, counting every member (directory and youth team).
function memberCategories(members: { field: string; photo?: string }[]): MemberCategory[] {
  const byField = new Map<string, { count: number; avatars: string[] }>();
  for (const m of members) {
    if (!m.field) continue;
    const c = byField.get(m.field) ?? { count: 0, avatars: [] };
    c.count++;
    if (m.photo && c.avatars.length < 3) c.avatars.push(m.photo);
    byField.set(m.field, c);
  }
  return [...byField].map(([title, c]) => ({ title, ...c })).sort((a, b) => b.count - a.count);
}

export default async function HomePage() {
  const [communities, jobs, events, people, youth, youthSettings, articles, episodes, home] = await Promise.all([
    getCommunities(), getJobs(), getEvents(), getNadlanistim(), getYouth(), getYouthSettings(), getArticles(), getEpisodes(), getHomeContent(),
  ]);
  // The directory already holds the youth team, so they count once.
  const categories = memberCategories(people);
  return <HomePageV6 communities={communities} jobs={jobs} events={events} people={people.map((p) => ({ ...publicCard(p), homepage: p.homepage }))} categories={categories} youth={{ count: youth.length, maxAge: youthSettings.maxAge }} articles={articles} episodes={episodes} home={home} />;
}
