import { notFound, redirect } from "next/navigation";
import { getArticles } from "../post-archive/wp";

// The old static article URL: sends to the featured article, else the newest, so the page has one address.
export default async function PostPage() {
  const all = await getArticles();
  const a = all.find((x) => x.featured) ?? all[0];
  if (!a) notFound();
  redirect(`/article/${encodeURIComponent(a.slug)}`);
}
