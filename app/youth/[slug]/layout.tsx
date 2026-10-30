import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getYouth } from "../wp";
import { roleLine } from "../data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const m = (await getYouth()).find((x) => x.slug === slug);
  if (!m) return { title: "חבר הנבחרת לא נמצא" };
  return pageMeta(m.name, m.oneLiner || roleLine(m) || "חבר בנבחרת הנדלניסטים הצעירים.", m.photo);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
