import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("הקהילות", "הקהילות המקצועיות בתוך הנדלניסטים לפי תחום. בוחרים תחום, נכנסים לשיחה ומכירים את מי שעובד בו.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
