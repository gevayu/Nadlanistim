import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getArticles } from "../../post-archive/wp";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const a = (await getArticles()).find((x) => x.slug === slug);
  if (!a) return { title: "המאמר לא נמצא" };
  return pageMeta(a.title, a.excerpt || "מאמר במרכז הידע של הנדלניסטים.", a.img);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
