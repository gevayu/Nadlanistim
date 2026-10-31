import { guard } from "@/lib/paywall";
import EventsBoard from "./EventsBoard";
import { getEvents } from "./wp";

export default async function EventsPage() {
  await guard("events", "/events"); // "חומת תשלום" in WordPress; open to everyone unless set otherwise
  return <EventsBoard events={await getEvents()} />;
}
