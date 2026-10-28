import { notFound } from "next/navigation";
import ArticleView from "../../post/ArticleView";
import { getArticles } from "../../post-archive/wp";

// WordPress links every article here (/article/<slug>); slugs are Hebrew, so they arrive URL-encoded.
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeURIComponent((await params).slug);
  const all = await getArticles();
  const a = all.find((x) => x.slug === slug);
  if (!a) notFound();
  return <ArticleView a={a} all={all} />;
}
