// Homepage-only content from WordPress: the "הגדרות אתר" home fields, deals ("חדר העסקאות") and partner logos.
import { byPublished, wpLines, wpQuery } from "../../lib/wp";

export type Deal = { title: string; img: string; tag: string; desc: string; period: string; partners: string; href: string };
export type Sponsor = { name: string; logo?: string; url?: string };
export type Stat = { count: number; label: string; suffix: string };
/** "יצירת קשר ורשתות" in "הגדרות אתר"; an empty field hides its button. */
export type Contact = { email: string; whatsapp: string; instagram: string; tiktok: string };
export type HomeSettings = { heroLines: string[]; heroSub: string; stats: Stat[]; marquee: string[]; contact: Contact };

type WpDeal = {
  databaseId: number;
  date: string;
  title: string;
  featuredImage: { node: { sourceUrl: string } } | null;
  dealFields: { tag: string | null; description: string | null; period: string | null; partners: string | null } | null;
  dealLink: { link: string | null } | null;
};

type WpSponsor = {
  databaseId: number;
  date: string;
  title: string;
  sponsorFields: { tier: string[] | null; websiteUrl: string | null; logo: { node: { sourceUrl: string } } | null } | null;
};

type WpSettings = {
  marquee: string | null;
  heroSub: string | null;
  heroLines: { line: string | null }[] | null;
  stats: { count: number | null; label: string | null; suffix: string | null }[] | null;
  contactEmail: string | null;
  whatsappUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
};

const QUERY = `{
  siteSettings { siteSettingsFields { marquee heroSub heroLines { line } stats { count label suffix } contactEmail whatsappUrl instagramUrl tiktokUrl } }
  deals(first: 100) { nodes {
    databaseId date title
    featuredImage { node { sourceUrl(size: MEDIUM_LARGE) } }
    dealFields { tag description period partners }
    dealLink { link }
  } }
  sponsors(first: 100) { nodes {
    databaseId date title
    sponsorFields { tier websiteUrl logo { node { sourceUrl } } }
  } }
}`;

const toDeal = ({ title, featuredImage, dealFields: f, dealLink }: WpDeal): Deal => ({
  title,
  img: featuredImage?.node.sourceUrl ?? "",
  tag: f?.tag ?? "",
  desc: f?.description ?? "",
  period: f?.period ?? "",
  partners: f?.partners ?? "",
  // "קישור העסקה" (mu-plugin nadlanistim-fields.php); empty sends the card to the collaborations board.
  href: dealLink?.link?.trim() || "/collaborations",
});

const toSponsor = ({ title, sponsorFields: f }: WpSponsor): Sponsor => ({
  name: title,
  logo: f?.logo?.node.sourceUrl,
  url: f?.websiteUrl || undefined,
});

const toSettings = (f: WpSettings | null): HomeSettings => ({
  heroLines: (f?.heroLines ?? []).map((r) => r.line ?? "").filter(Boolean),
  heroSub: f?.heroSub ?? "",
  stats: (f?.stats ?? [])
    .filter((s) => s.count != null && s.label)
    .map((s) => ({ count: s.count!, label: s.label!, suffix: s.suffix ?? "" })),
  marquee: wpLines(f?.marquee),
  contact: {
    email: f?.contactEmail?.trim() ?? "",
    whatsapp: f?.whatsappUrl?.trim() ?? "",
    instagram: f?.instagramUrl?.trim() ?? "",
    tiktok: f?.tiktokUrl?.trim() ?? "",
  },
});

/** The home fields of "הגדרות אתר", deals, and the "main" tier partners (event-tier partners belong to event pages). */
export async function getHomeContent(): Promise<{ settings: HomeSettings; deals: Deal[]; sponsors: Sponsor[] }> {
  const data = await wpQuery<{
    siteSettings: { siteSettingsFields: WpSettings | null } | null;
    deals: { nodes: WpDeal[] };
    sponsors: { nodes: WpSponsor[] };
  }>(QUERY);
  return {
    settings: toSettings(data.siteSettings?.siteSettingsFields ?? null),
    deals: data.deals.nodes.sort(byPublished).map(toDeal),
    sponsors: data.sponsors.nodes
      .filter((s) => s.sponsorFields?.tier?.includes("main"))
      .sort(byPublished)
      .map(toSponsor),
  };
}
