import CollabBoard from "./CollabBoard";
import { onBoard } from "./data";
import { getCollabs, getCollabTabs } from "./wp";

export default async function CollaborationsPage() {
  // The board shows cards only. Description, needs, tags and contact are members-only (/collaboration/<slug>),
  // so they stay out of the page data.
  const [collabs, tabs] = await Promise.all([getCollabs(), getCollabTabs()]);
  const cards = collabs.filter(onBoard).map((c) => ({ ...c, description: [], lookingList: [], tags: [], email: "", phone: "" }));
  return <CollabBoard collabs={cards} tabs={tabs} />;
}
