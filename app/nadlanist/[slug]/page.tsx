import Profile from "./Profile";
import { getNadlanistim } from "../../nadlanistim/wp";

export default async function NadlanistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Profile people={await getNadlanistim()} slug={decodeURIComponent(slug)} />;
}
