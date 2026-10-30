import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getPost } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPost((await params).slug);
  if (!p) return { title: "הכתבה לא נמצאה" };
  return pageMeta(p.title, p.excerpt, p.heroImage || p.image);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
