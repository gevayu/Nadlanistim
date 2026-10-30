import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("איפוס סיסמה", "שולחים קישור לבחירת סיסמה חדשה לאימייל של החשבון.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
