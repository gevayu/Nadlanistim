import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("לוח דרושים לחברים", "הפרטים המלאים של כל מודעה, מפרסם, סוג משרה, מיקום ותיאור, פתוחים לחברי הנדלניסטים.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
