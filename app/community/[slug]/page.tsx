import CommunityView from "./CommunityView";
import { getCommunities } from "../../communities/wp";

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeURIComponent((await params).slug);
  const all = await getCommunities();
  return (
    <CommunityView
      c={all.find((x) => x.slug === slug)}
      others={all.filter((x) => x.slug !== slug).slice(0, 3)}
    />
  );
}
