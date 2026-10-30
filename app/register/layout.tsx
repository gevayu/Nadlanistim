import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("פתיחת חשבון", "חשבון באתר מחבר את החברות שלכם בקהילה לפרופיל במדריך הנדלניסטים.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
