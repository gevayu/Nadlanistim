import CollabBoard from "./CollabBoard";
import { onBoard } from "./data";
import { getCollabs, getCollabTabs } from "./wp";
import { guard } from "@/lib/paywall";

export default async function CollaborationsPage() {
  // The board shows cards only. Description, needs, tags and contact are members-only (/collaboration/<slug>),
  // so they stay out of the page data; so does who published it, unless the visitor is a paying member.
  // "חומת תשלום" decides whether a guest sees the publishers, sees them blurred, or is sent elsewhere.
  const [collabs, tabs, { locked }] = await Promise.all([getCollabs(), getCollabTabs(), guard("collabBoard", "/collaborations")]);
  const member = !locked;
  const cards = collabs.filter(onBoard).map((c) => ({
    ...c, description: [], lookingList: [], tags: [], email: "", phone: "",
    ...(!member && { by: "", byRole: "" }),
  }));
  return <CollabBoard collabs={cards} tabs={tabs} locked={!member} />;
}
