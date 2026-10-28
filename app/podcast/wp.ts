// Podcast episodes from WordPress (nad_podcast + its podcastFields ACF group).
import { wpLines, wpQuery } from "../../lib/wp";
import type { Episode } from "./data";

type WpEpisode = {
  slug: string;
  title: string;
  featuredImage: { node: { sourceUrl: string } } | null;
  podcastFields: {
    episodeNumber: number | null;
    description: string | null;
    guests: string | null;
    duration: string | null;
    airDate: string | null;
    notes: string | null;
    audioSrc: string | null;
    audioUrl: string | null;
  } | null;
};

const QUERY = `{ podcasts(first: 100) { nodes {
  slug title
  featuredImage { node { sourceUrl(size: LARGE) } }
  podcastFields { episodeNumber description guests duration airDate notes audioSrc audioUrl }
} } }`;

const toEpisode = ({ slug, title, featuredImage, podcastFields: f }: WpEpisode): Episode => ({
  slug,
  num: f?.episodeNumber ?? 0,
  title,
  guests: f?.guests ?? "",
  desc: f?.description ?? "",
  img: featuredImage?.node.sourceUrl ?? "",
  duration: f?.duration ?? "",
  date: f?.airDate ?? "",
  notes: wpLines(f?.notes),
  audio: f?.audioSrc ?? undefined,
  listen: f?.audioUrl ?? undefined,
});

/** All episodes, latest episode number first. */
export async function getEpisodes(): Promise<Episode[]> {
  const data = await wpQuery<{ podcasts: { nodes: WpEpisode[] } }>(QUERY);
  return data.podcasts.nodes.map(toEpisode).sort((a, b) => b.num - a.num);
}
