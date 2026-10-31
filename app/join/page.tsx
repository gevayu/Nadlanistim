import type { Metadata } from "next";
import JoinView from "./JoinView";
import { pageMeta } from "@/lib/seo";
import { redirect } from "next/navigation";
import { getMembershipPlans } from "../../lib/store";
import { getPaywall } from "../../lib/paywall";

export const metadata: Metadata = pageMeta("הצטרפות לקהילה", "הצטרפו לקהילת הנדלניסטים: אירועים, מדריך החברים, לוח דרושים ושיתופי פעולה עם אנשי מקצוע מהענף.");

export default async function JoinPage() {
  // Every join button on the site points here; "חומת תשלום" can send them to another address instead.
  const { join } = await getPaywall();
  if (join !== "/join") redirect(join);
  // Plans are live (no cache). If the store is down, the page still serves the application form, without plans.
  const plans = await getMembershipPlans().catch((e) => {
    console.error(e);
    return [];
  });
  return <JoinView plans={plans} />;
}
