import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { guard } from "@/lib/paywall";

export const metadata: Metadata = pageMeta("פרסום שיתוף פעולה", "מפרסמים פרויקט או הזדמנות ומוצאים שותף מתוך הקהילה. חינם לחברי הנדלניסטים.");

// Who may post is set in "חומת תשלום" (open to everyone by default).
export default async function Layout({ children }: { children: React.ReactNode }) {
  await guard("collabNew", "/collaboration-new");
  return children;
}
