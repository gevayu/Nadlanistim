import type { Metadata } from "next";
import { sectionMeta } from "@/lib/seo";

export const metadata: Metadata = sectionMeta("לוח דרושים", "משרות, מחפשי עבודה, נותני שירות ושותפים עסקיים מתוך קהילת הנדל״ן.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
