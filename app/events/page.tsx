import EventsBoard from "./EventsBoard";
import { getEvents } from "./wp";

export default async function EventsPage() {
  return <EventsBoard events={await getEvents()} />;
}
