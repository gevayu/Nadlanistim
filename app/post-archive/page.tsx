import ArchiveView from "./ArchiveView";
import { getArticles } from "./wp";

// WordPress links its category and tag archives here as ?cat=<name> / ?tag=<name>.
export default async function PostArchivePage({ searchParams }: { searchParams: Promise<{ cat?: string; tag?: string }> }) {
  const { cat, tag } = await searchParams;
  const posts = (await getArticles()).filter((a) => (!cat || a.cats.includes(cat)) && (!tag || a.tags.includes(tag)));
  return <ArchiveView posts={posts} filter={cat ?? tag} />;
}
