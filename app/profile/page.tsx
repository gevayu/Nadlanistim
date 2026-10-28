import Profile from "../nadlanist/[slug]/Profile";
import { CURRENT_MEMBER } from "../nadlanistim/data";
import { getNadlanistim } from "../nadlanistim/wp";

// The signed-in member's own profile: the same view as /nadlanist/<slug>, with their /my-account edits.
export default async function ProfilePage() {
  return <Profile people={await getNadlanistim()} slug={CURRENT_MEMBER} />;
}
