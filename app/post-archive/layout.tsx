import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("מרכז הידע", "מאמרים, מדריכים והסברים מקצועיים על שוק הנדל״ן בישראל.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
