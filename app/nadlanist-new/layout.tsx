import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("הצטרפות למדריך הנדלניסטים", "ממלאים פרופיל ומופיעים במדריך הנדלניסטים, כדי שחברי הקהילה ימצאו אתכם לפי תחום ומיקום.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
