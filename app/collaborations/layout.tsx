import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("שיתופי פעולה עסקיים", "לוח שיתופי הפעולה של הקהילה: שותפים, משקיעים ונותני שירות לפרויקטים בנדל״ן.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
