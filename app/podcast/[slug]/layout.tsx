import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getEpisodes } from "../wp";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const ep = (await getEpisodes()).find((e) => e.slug === slug);
  if (!ep) return { title: "הפרק לא נמצא" };
  return pageMeta(ep.title, ep.desc || (ep.guests ? `נדלפודקאסט עם ${ep.guests}.` : "פרק בנדלפודקאסט."), ep.img);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
