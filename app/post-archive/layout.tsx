import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("בית הידע", "מאמרים, מדריכים והסברים מקצועיים על שוק הנדל״ן בישראל.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
