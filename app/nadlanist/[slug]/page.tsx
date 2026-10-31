import Profile from "./Profile";
import { notFound } from "next/navigation";
import { getSession } from "../../../lib/auth";
import { guard } from "@/lib/paywall";
import { publicCard } from "../../nadlanistim/data";
import { getNadlanistim } from "../../nadlanistim/wp";
import { getCommunities } from "../../communities/wp";

// Members only by default ("חומת תשלום"): unlocked, the whole profile; locked, the directory card and the lock.
export default async function NadlanistPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeURIComponent((await params).slug);
  const [people, session, all, { locked }] = await Promise.all([getNadlanistim(), getSession(), getCommunities(), guard("nadlanistPage", `/nadlanist/${slug}`)]);
  const n = people.find((x) => x.slug === slug);
  if (!n) notFound();
  // The communities the member ticked in /profile, by name, in the order the communities page shows them.
  const communities = locked || !n ? [] : all.filter((c) => n.communities?.includes(c.slug)).map(({ slug, name }) => ({ slug, name }));
  return <Profile n={n && (locked ? publicCard(n) : n)} locked={locked} session={session} communities={communities} />;
}
