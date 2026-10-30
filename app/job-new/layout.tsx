import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("פרסום בלוח הדרושים", "מפרסמים משרה, שירות או חיפוש עבודה מול אנשי המקצוע של הקהילה. חינם לחברי הנדלניסטים.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
