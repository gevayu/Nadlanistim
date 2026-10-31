import { guard } from "@/lib/paywall";
import { notFound, redirect } from "next/navigation";
import { getArticles } from "../post-archive/wp";

// The old static article URL: sends to the featured article, else the newest, so the page has one address.
export default async function PostPage() {
  await guard("article", "/post-archive"); // "חומת תשלום" in WordPress; open to everyone unless set otherwise
  const all = await getArticles();
  const a = all.find((x) => x.featured) ?? all[0];
  if (!a) notFound();
  redirect(`/article/${encodeURIComponent(a.slug)}`);
}
