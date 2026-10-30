import type { Metadata } from "next";
import { sectionMeta } from "@/lib/seo";

export const metadata: Metadata = sectionMeta("נדלפודקאסט", "הפודקאסט של הנדלניסטים: שיחות עומק עם אנשים שפועלים בשוק הנדל״ן בישראל. פרק חדש כל שבועיים.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
