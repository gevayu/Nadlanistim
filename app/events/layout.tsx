import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("אירועים", "כל אירועי הנדלניסטים במקום אחד: מפגשי נטוורקינג, כנסים, הרצאות ואירועי התנדבות, הקרובים והקודמים.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
