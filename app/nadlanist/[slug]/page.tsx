import Profile from "./Profile";
import { getSession } from "../../../lib/auth";
import { publicCard } from "../../nadlanistim/data";
import { getNadlanistim } from "../../nadlanistim/wp";
import { getCommunities } from "../../communities/wp";

// Members only: a paying member sees the whole profile; anyone else gets the directory card and the lock.
export default async function NadlanistPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeURIComponent((await params).slug);
  const [people, session, all] = await Promise.all([getNadlanistim(), getSession(), getCommunities()]);
  const n = people.find((x) => x.slug === slug);
  const locked = !session?.member;
  // The communities the member ticked in /my-account, by name, in the order the communities page shows them.
  const communities = locked || !n ? [] : all.filter((c) => n.communities?.includes(c.slug)).map(({ slug, name }) => ({ slug, name }));
  return <Profile n={n && (locked ? publicCard(n) : n)} locked={locked} session={session} communities={communities} />;
}
