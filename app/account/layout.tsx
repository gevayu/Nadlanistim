import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

// Signed-in pages stay out of search results.
export const metadata: Metadata = { ...pageMeta("האזור האישי", "האזור האישי של חברי הנדלניסטים: אירועים, שיתופי פעולה, משרות ופרקים חדשים."), robots: { index: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
