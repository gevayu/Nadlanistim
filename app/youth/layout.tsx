import type { Metadata } from "next";
import { sectionMeta } from "@/lib/seo";

export const metadata: Metadata = sectionMeta("נבחרת הצעירים", "נבחרת הנדלניסטים הצעירים: אנשי נדל״ן צעירים מהקהילה, מה כל אחד עושה, ואיך מגישים מועמדות.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
