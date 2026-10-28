import HomePageV6 from "./HomeV6";
import { getCommunities } from "../communities/wp";
import { getEvents } from "../events/wp";
import { getJobs } from "../jobs/wp";
import { getArticles } from "../post-archive/wp";
import { getEpisodes } from "../podcast/wp";
import { getHomeContent } from "./wp";

export default async function HomePage() {
  const [communities, jobs, events, articles, episodes, home] = await Promise.all([
    getCommunities(), getJobs(), getEvents(), getArticles(), getEpisodes(), getHomeContent(),
  ]);
  return <HomePageV6 communities={communities} jobs={jobs} events={events} articles={articles} episodes={episodes} home={home} />;
}
