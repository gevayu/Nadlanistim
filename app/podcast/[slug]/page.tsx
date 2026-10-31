import { guard } from "@/lib/paywall";
import EpisodeView from "./EpisodeView";
import { getEpisodes } from "../wp";

export default async function EpisodePage({ params }: { params: Promise<{ slug: string }> }) {
  await guard("episode", "/podcast"); // "חומת תשלום" in WordPress; open to everyone unless set otherwise
  const slug = decodeURIComponent((await params).slug);
  const all = await getEpisodes();
  return (
    <EpisodeView
      ep={all.find((e) => e.slug === slug)}
      others={all.filter((e) => e.slug !== slug).slice(0, 3)}
    />
  );
}
