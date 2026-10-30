import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

// Signed-in pages stay out of search results.
export const metadata: Metadata = { ...pageMeta("החשבון שלי", "עריכת הפרטים שמופיעים בכרטיס שלך במדריך הנדלניסטים ובעמוד הפרופיל."), robots: { index: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
