import MyAccount from "./MyAccount";
import { requireSession } from "../../lib/auth";
import { getCommunities } from "../communities/wp";
import type { Nadlanist } from "../nadlanistim/data";

export default async function MyAccountPage() {
  const [session, communities] = await Promise.all([requireSession("/my-account"), getCommunities()]);
  const own = session.nadlanist;
  // The member's own post as WordPress has it now (drafts included), or an empty form for a first profile.
  const me: Nadlanist = {
    slug: own?.slug ?? "",
    name: own?.name || session.name,
    role: own?.role ?? "",
    field: own?.field ?? "",
    place: own?.place ?? "",
    quote: own?.quote ?? "",
    bio: own?.bio ?? [],
    email: session.email,
    phone: session.phone,
    photo: own?.photo || undefined,
    linkedin: own?.linkedin ?? "",
    instagram: own?.instagram ?? "",
    openToWork: own?.openToWork ?? false,
    communities: own?.communities ?? [],
  };
  return (
    <MyAccount
      me={me}
      status={own?.status ?? null}
      verified={session.verified}
      communities={communities.map(({ slug, name }) => ({ slug, name }))}
    />
  );
}
