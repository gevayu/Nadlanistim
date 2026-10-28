// Communities from WordPress (nad_community + its "פרטי קהילה" ACF group).
import { byPublished, wpLines, wpQuery } from "../../lib/wp";
import type { Community, HappeningIcon } from "./data";

type WpCommunity = {
  databaseId: number;
  date: string;
  slug: string;
  title: string;
  featuredImage: { node: { sourceUrl: string } } | null;
  communityFields: {
    tagline: string | null;
    membersCount: number | null;
    logo: { node: { sourceUrl: string } } | null;
    about: string | null;
    happenings: string | null;
    gallery: { nodes: { sourceUrl: string }[] } | null;
    linkUrl: string | null;
  } | null;
};

const QUERY = `{ communities(first: 100) { nodes {
  databaseId date slug title
  featuredImage { node { sourceUrl(size: LARGE) } }
  communityFields {
    tagline membersCount about happenings linkUrl
    logo { node { sourceUrl(size: MEDIUM) } }
    gallery { nodes { sourceUrl(size: MEDIUM_LARGE) } }
  }
} } }`;

// "מה קורה בקהילה" lines are "emoji | title | text"; the site shows white line icons, not the emoji.
const EMOJI_ICON: Record<string, HappeningIcon> = { "📅": "calendar", "💬": "chat", "🎓": "expert", "🤝": "deal" };

const toCommunity = ({ slug, title, featuredImage, communityFields: f }: WpCommunity): Community => {
  const happenings = wpLines(f?.happenings).map((line) => {
    const [emoji = "", t = "", d = ""] = line.split("|").map((p) => p.trim());
    return { ic: EMOJI_ICON[emoji] ?? "calendar", t, d };
  });
  return {
    slug,
    name: title,
    tagline: f?.tagline ?? "",
    members: String(f?.membersCount ?? ""),
    cover: featuredImage?.node.sourceUrl ?? "",
    about: wpLines(f?.about),
    happenings,
    gallery: f?.gallery?.nodes.map((g) => g.sourceUrl) ?? [],
    logo: f?.logo?.node.sourceUrl,
    whatsapp: f?.linkUrl || undefined,
  };
};

/** All communities, oldest first. */
export async function getCommunities(): Promise<Community[]> {
  const data = await wpQuery<{ communities: { nodes: WpCommunity[] } }>(QUERY);
  return data.communities.nodes.sort(byPublished).map(toCommunity);
}
