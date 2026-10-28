// Homepage-only content from WordPress: deals ("חדר העסקאות") and partner logos ("מיוצגים בקהילה").
import { byPublished, wpQuery } from "../../lib/wp";

export type Deal = { title: string; img: string; tag: string; desc: string; period: string; partners: string };
export type Sponsor = { name: string; logo?: string; url?: string };

type WpDeal = {
  databaseId: number;
  date: string;
  title: string;
  featuredImage: { node: { sourceUrl: string } } | null;
  dealFields: { tag: string | null; description: string | null; period: string | null; partners: string | null } | null;
};

type WpSponsor = {
  databaseId: number;
  date: string;
  title: string;
  sponsorFields: { tier: string[] | null; websiteUrl: string | null; logo: { node: { sourceUrl: string } } | null } | null;
};

const QUERY = `{
  deals(first: 100) { nodes {
    databaseId date title
    featuredImage { node { sourceUrl(size: MEDIUM_LARGE) } }
    dealFields { tag description period partners }
  } }
  sponsors(first: 100) { nodes {
    databaseId date title
    sponsorFields { tier websiteUrl logo { node { sourceUrl } } }
  } }
}`;

const toDeal = ({ title, featuredImage, dealFields: f }: WpDeal): Deal => ({
  title,
  img: featuredImage?.node.sourceUrl ?? "",
  tag: f?.tag ?? "",
  desc: f?.description ?? "",
  period: f?.period ?? "",
  partners: f?.partners ?? "",
});

const toSponsor = ({ title, sponsorFields: f }: WpSponsor): Sponsor => ({
  name: title,
  logo: f?.logo?.node.sourceUrl,
  url: f?.websiteUrl || undefined,
});

/** Deals, and the "main" tier partners (event-tier partners belong to event pages). */
export async function getHomeContent(): Promise<{ deals: Deal[]; sponsors: Sponsor[] }> {
  const data = await wpQuery<{ deals: { nodes: WpDeal[] }; sponsors: { nodes: WpSponsor[] } }>(QUERY);
  return {
    deals: data.deals.nodes.sort(byPublished).map(toDeal),
    sponsors: data.sponsors.nodes
      .filter((s) => s.sponsorFields?.tier?.includes("main"))
      .sort(byPublished)
      .map(toSponsor),
  };
}
