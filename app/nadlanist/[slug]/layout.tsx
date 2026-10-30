import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getNadlanistim } from "../../nadlanistim/wp";

// Public card fields only (name, role, place, quote, photo): the bio is for paying members.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const n = (await getNadlanistim()).find((x) => x.slug === slug);
  if (!n) return { title: "הנדלניסט לא נמצא" };
  const line = [n.role, n.place].filter(Boolean).join(", ");
  return pageMeta(n.name, [line, n.quote && `"${n.quote}"`].filter(Boolean).join(". ") || "כרטיס במדריך הנדלניסטים.", n.photo);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
