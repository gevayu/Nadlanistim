import CollabBoard from "./CollabBoard";
import { getCollabs } from "./wp";

export default async function CollaborationsPage() {
  return <CollabBoard collabs={await getCollabs()} />;
}
