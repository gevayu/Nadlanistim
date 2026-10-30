import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getJobById } from "../../jobs/wp";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const job = await getJobById(Number((await params).id));
  if (!job) return { title: "המשרה לא נמצאה" };
  const by = job.company || job.by;
  return pageMeta(by ? `${job.title}, ${by}` : job.title, job.desc || [job.type, job.place].filter(Boolean).join(", "), job.img);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
