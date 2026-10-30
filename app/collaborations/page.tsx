import CollabBoard from "./CollabBoard";
import { onBoard } from "./data";
import { getCollabs, getCollabTabs } from "./wp";
import { getSession } from "../../lib/auth";

export default async function CollaborationsPage() {
  // The board shows cards only. Description, needs, tags and contact are members-only (/collaboration/<slug>),
  // so they stay out of the page data; so does who published it, unless the visitor is a paying member.
  const [collabs, tabs, session] = await Promise.all([getCollabs(), getCollabTabs(), getSession()]);
  const member = !!session?.member;
  const cards = collabs.filter(onBoard).map((c) => ({
    ...c, description: [], lookingList: [], tags: [], email: "", phone: "",
    ...(!member && { by: "", byRole: "" }),
  }));
  return <CollabBoard collabs={cards} tabs={tabs} locked={!member} />;
}
