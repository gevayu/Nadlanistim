import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { pageMeta } from "@/lib/seo";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = pageMeta("פרסום בלוח הדרושים", "מפרסמים משרה, שירות או חיפוש עבודה מול אנשי המקצוע של הקהילה. חינם לחברי הנדלניסטים.");

// Posting is for signed-in members only; anyone else lands on the join page.
export default async function Layout({ children }: { children: React.ReactNode }) {
  if (!(await getSession())?.member) redirect("/join");
  return children;
}
