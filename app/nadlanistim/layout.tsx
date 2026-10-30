import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("הכר את הנדלניסט", "מדריך חברי הקהילה לפי תחום ומיקום, עם כרטיס וסיפור אישי לכל נדלניסט.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
