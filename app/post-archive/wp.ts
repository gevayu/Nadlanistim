// "בית הידע" articles from WordPress (nad_article + its ACF groups: articleFields, and the articleBody flexible layout).
import { byPublished, wpLines, wpQuery } from "../../lib/wp";
import type { Article, Block } from "./data";

type Img = { node: { sourceUrl: string } } | null;

// One flexible-content row; which fields are set depends on the layout (__typename).
type WpBlock = {
  __typename: string;
  text?: string | null;
  accent?: string | null;
  items?: string | null;
  caption?: string | null;
  image?: Img;
};

type WpArticle = {
  databaseId: number;
  date: string;
  slug: string;
  title: string;
  content: string | null;
  featuredImage: Img;
  articleCategories: { nodes: { name: string }[] };
  articleTags: { nodes: { name: string }[] };
  articleBody: { body: WpBlock[] | null } | null;
  articleFields: {
    titleMain: string | null;
    titleAccent: string | null;
    excerpt: string | null;
    isFeatured: boolean | null;
    contentType: string[] | null;
    authorName: string | null;
    authorFirm: string | null;
    authorSpecialty: string | null;
    authorBio: string | null;
    authorAvatar: Img;
  } | null;
};

// ponytail: heading `level` (always h2) and list `ordered` (never set) are ignored; the design has one style for each.
const QUERY = `{ articles(first: 100) { nodes {
  databaseId date slug title content
  featuredImage { node { sourceUrl(size: LARGE) } }
  articleCategories { nodes { name } }
  articleTags { nodes { name } }
  articleBody { body {
    __typename
    ... on ArticleBodyBodyParagraphLayout { text }
    ... on ArticleBodyBodyHeadingLayout { text accent }
    ... on ArticleBodyBodyListLayout { items }
    ... on ArticleBodyBodyQuoteLayout { text }
    ... on ArticleBodyBodyImageLayout { caption image { node { sourceUrl(size: LARGE) } } }
  } }
  articleFields {
    titleMain titleAccent excerpt isFeatured contentType
    authorName authorFirm authorSpecialty authorBio
    authorAvatar { node { sourceUrl(size: THUMBNAIL) } }
  }
} } }`;

const toBlock = (b: WpBlock): Block | null => {
  const text = b.text ?? "";
  switch (b.__typename.replace(/^ArticleBodyBody|Layout$/g, "")) {
    case "Paragraph": return text ? { kind: "p", text } : null;
    case "Quote": return text ? { kind: "quote", text } : null;
    case "Heading": return text ? { kind: "h2", text, accent: b.accent ?? undefined } : null;
    case "List": return wpLines(b.items).length ? { kind: "list", items: wpLines(b.items) } : null;
    case "Image": return b.image ? { kind: "img", src: b.image.node.sourceUrl, caption: b.caption ?? "" } : null;
    default: return null;
  }
};

// Silent reading speed for Hebrew: Brysbaert (2019, J. Memory & Language) averages 224 wpm over five
// Hebrew studies (English non-fiction: 238). Hebrew packs prefixes into words, so fewer words carry the
// same text. Rounded down to 220 because these are professional articles full of figures and terms.
const WORDS_PER_MINUTE = 220;

/** Reading time from the article's own text: every word in the body, rounded up, at least a minute. */
const minutesToRead = (blocks: Block[], html: string) => {
  const text = blocks
    .map((b) => (b.kind === "list" ? b.items.join(" ") : b.kind === "img" ? b.caption : b.kind === "h2" ? `${b.text} ${b.accent ?? ""}` : b.text))
    .concat(html)
    .join(" ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[#\w]+;/g, " ");
  const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
};

const toArticle = ({ date, slug, title, content, featuredImage, articleCategories, articleTags, articleBody, articleFields: f }: WpArticle): Article => {
  const body = (articleBody?.body ?? []).map(toBlock).filter((b): b is Block => b !== null);
  const html = body.length ? undefined : content ?? undefined;
  return {
    slug,
    title,
    titleMain: f?.titleMain ?? title,
    titleAccent: f?.titleAccent ?? "",
    img: featuredImage?.node.sourceUrl ?? "",
    type: f?.contentType?.[0] ?? "",
    cats: articleCategories.nodes.map((n) => n.name),
    tags: articleTags.nodes.map((n) => n.name),
    minutes: minutesToRead(body, html ?? ""),
    excerpt: f?.excerpt ?? "",
    author: {
      name: f?.authorName ?? "",
      avatar: f?.authorAvatar?.node.sourceUrl ?? "",
      role: [f?.authorFirm, f?.authorSpecialty].filter(Boolean).join(" · "),
      bio: f?.authorBio ?? "",
    },
    date: new Date(date).toLocaleDateString("he-IL", { month: "long", year: "numeric" }),
    featured: !!f?.isFeatured,
    body,
    html,
  };
};

/** All articles, newest first. */
export async function getArticles(): Promise<Article[]> {
  const data = await wpQuery<{ articles: { nodes: WpArticle[] } }>(QUERY);
  return data.articles.nodes.sort((a, b) => byPublished(b, a)).map(toArticle);
}
