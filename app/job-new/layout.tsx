import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { guard } from "@/lib/paywall";

export const metadata: Metadata = pageMeta("פרסום בלוח הדרושים", "מפרסמים משרה, שירות או חיפוש עבודה מול אנשי המקצוע של הקהילה. חינם לחברי הנדלניסטים.");

// Who may post is set in "חומת תשלום" (members only by default; anyone else is sent to the join page).
export default async function Layout({ children }: { children: React.ReactNode }) {
  await guard("jobNew", "/job-new");
  return children;
}
