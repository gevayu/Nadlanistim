import { notFound } from "next/navigation";
import RecapView from "./RecapView";
import { getEvent, getFeaturedEvent } from "../events/wp";

export default async function EventRecapPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const [ev, next] = await Promise.all([getEvent("/event-recap", (await searchParams).e), getFeaturedEvent()]);
  if (!ev) notFound();
  return <RecapView ev={ev} next={next} />;
}
