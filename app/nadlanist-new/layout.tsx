import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { pageMeta } from "@/lib/seo";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = pageMeta("הצטרפות למדריך הנדלניסטים", "ממלאים פרופיל ומופיעים במדריך הנדלניסטים, כדי שחברי הקהילה ימצאו אתכם לפי תחום ומיקום.");

// The directory and youth-team form is for signed-in members only; anyone else lands on the join page.
export default async function Layout({ children }: { children: React.ReactNode }) {
  if (!(await getSession())?.member) redirect("/join");
  return children;
}
