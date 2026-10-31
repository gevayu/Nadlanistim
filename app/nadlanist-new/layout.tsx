import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { guard } from "@/lib/paywall";

export const metadata: Metadata = pageMeta("הצטרפות למדריך הנדלניסטים", "ממלאים פרופיל ומופיעים במדריך הנדלניסטים, כדי שחברי הקהילה ימצאו אתכם לפי תחום ומיקום.");

// The directory and youth-team form; who may use it is set in "חומת תשלום" (members only by default).
export default async function Layout({ children }: { children: React.ReactNode }) {
  await guard("nadlanistNew", "/nadlanist-new");
  return children;
}
