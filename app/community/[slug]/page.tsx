import { guard } from "@/lib/paywall";
import CommunityView from "./CommunityView";
import { getCommunities } from "../../communities/wp";
import { getNadlanistim } from "../../nadlanistim/wp";
import { publicCard } from "../../nadlanistim/data";

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  await guard("communityPage", "/communities"); // "חומת תשלום" in WordPress; open to everyone unless set otherwise
  const slug = decodeURIComponent((await params).slug);
  const [all, people] = await Promise.all([getCommunities(), getNadlanistim()]);
  return (
    <CommunityView
      c={all.find((x) => x.slug === slug)}
      others={all.filter((x) => x.slug !== slug).slice(0, 3)}
      // "חלק מהחברים בקהילה": members who ticked this community in their profile.
      people={people.filter((p) => p.communities?.includes(slug)).map(publicCard)}
    />
  );
}
