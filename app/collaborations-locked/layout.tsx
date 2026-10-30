import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("שיתופי פעולה לחברים", "הפרטים המלאים של כל עסקה, כולל שותפים, מיקום, היקף השקעה ופרטי קשר, פתוחים לחברי הנדלניסטים.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
