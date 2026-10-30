import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("פרסום שיתוף פעולה", "מפרסמים פרויקט או הזדמנות ומוצאים שותף מתוך הקהילה. חינם לחברי הנדלניסטים.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
