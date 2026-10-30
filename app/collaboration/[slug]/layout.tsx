import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getCollabs } from "../../collaborations/wp";

// Only what the board card already shows: the full listing is for paying members.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const c = (await getCollabs()).find((x) => x.slug === slug);
  if (!c) return { title: "שיתוף הפעולה לא נמצא" };
  const line = [c.type, c.place].filter(Boolean).join(", ");
  return pageMeta(c.title, `${line ? line + ". " : ""}שיתוף פעולה בלוח של הנדלניסטים.`, c.img);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
