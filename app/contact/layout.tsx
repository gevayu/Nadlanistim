import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("צור קשר", "שאלה, הצעה לשיתוף פעולה או בקשה להצטרף לקהילה? כתבו לנו ונחזור אליכם.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
