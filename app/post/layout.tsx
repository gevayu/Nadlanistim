import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getArticles } from "../post-archive/wp";

// /post shows the featured article (same pick as page.tsx).
export async function generateMetadata(): Promise<Metadata> {
  const all = await getArticles();
  const a = all.find((x) => x.featured) ?? all[0];
  if (!a) return { title: "בית הידע" };
  return pageMeta(a.title, a.excerpt || "מאמר בבית הידע של הנדלניסטים.", a.img);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
