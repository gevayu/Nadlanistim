import { notFound } from "next/navigation";
import ArticleView from "./ArticleView";
import { getArticles } from "../post-archive/wp";

// The old static article URL: shows the featured article, else the newest. Real article links are /article/<slug>.
export default async function PostPage() {
  const all = await getArticles();
  const a = all.find((x) => x.featured) ?? all[0];
  if (!a) notFound();
  return <ArticleView a={a} all={all} />;
}
