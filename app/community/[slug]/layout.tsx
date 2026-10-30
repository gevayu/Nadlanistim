import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getCommunities } from "../../communities/wp";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const c = (await getCommunities()).find((x) => x.slug === slug);
  if (!c) return { title: "הקהילה לא נמצאה" };
  return pageMeta(c.name, c.tagline || c.about[0] || `קהילת ${c.name} בתוך הנדלניסטים.`, c.cover);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
