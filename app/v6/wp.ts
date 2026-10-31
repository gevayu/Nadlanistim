// Homepage-only content from WordPress: the "הגדרות אתר" home fields, deals ("חדר העסקאות") and partner logos.
import { byPublished, wpLines, wpQuery } from "../../lib/wp";

export type Deal = { title: string; img: string; tag: string; desc: string; period: string; partners: string; href: string };
export type Sponsor = { name: string; logo?: string; url?: string };
export type Stat = { count: number; label: string; suffix: string };
/** "יצירת קשר ורשתות" in "הגדרות אתר"; an empty field hides its button. */
export type Contact = { email: string; whatsapp: string; instagram: string; tiktok: string };
/** "עמוד הבית: תמונות ו"מי אנחנו"" in "הגדרות אתר" (mu-plugin nadlanistim-fields.php); empty parts are hidden. */
export type HomeAbout = {
  heroImage: string;
  /** WordPress's resized copies ("url 1536w, ..."), "" when it has none. */
  heroSrcSet: string;
  title: string[];
  paragraphs: string[];
  points: string[];
  imageLarge: string;
  imageSmall: string;
  badgeNumber: number | null;
  badgeText: string[];
  featuredBg: string;
};
export type HomeSettings = { heroLines: string[]; heroSub: string; stats: Stat[]; marquee: string[]; contact: Contact; about: HomeAbout };

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

type Img = { node: { sourceUrl: string } } | null;
type WpHome = {
  homeHeroImage: { node: { sourceUrl: string; srcSet: string | null } } | null;
  homeAboutTitle: string | null;
  homeAboutText: string | null;
  homeAboutPoints: string | null;
  homeAboutImageLarge: Img;
  homeAboutImageSmall: Img;
  homeAboutBadgeNumber: number | null;
  homeAboutBadgeText: string | null;
  homeFeaturedBg: Img;
};

const QUERY = `{
  siteSettings { siteSettingsFields { marquee heroSub heroLines { line } stats { count label suffix } contactEmail whatsappUrl instagramUrl tiktokUrl }
    homeContent {
      homeHeroImage { node { sourceUrl srcSet } } homeAboutTitle homeAboutText homeAboutPoints
      homeAboutImageLarge { node { sourceUrl } } homeAboutImageSmall { node { sourceUrl } }
      homeAboutBadgeNumber homeAboutBadgeText homeFeaturedBg { node { sourceUrl } }
    } }
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

const img = (i: Img) => i?.node.sourceUrl ?? "";

const toAbout = (h: WpHome | null, stats: Stat[]): HomeAbout => ({
  heroImage: img(h?.homeHeroImage ?? null),
  heroSrcSet: h?.homeHeroImage?.node.srcSet ?? "",
  title: wpLines(h?.homeAboutTitle),
  // "{מספר חברים}" is the first "מספרים" count, so the paragraph never disagrees with the stats strip.
  paragraphs: wpLines(h?.homeAboutText).map((p) => p.replace("{מספר חברים}", stats[0] ? stats[0].count.toLocaleString("en-US") : "")),
  points: wpLines(h?.homeAboutPoints),
  imageLarge: img(h?.homeAboutImageLarge ?? null),
  imageSmall: img(h?.homeAboutImageSmall ?? null),
  badgeNumber: h?.homeAboutBadgeNumber ?? null,
  badgeText: wpLines(h?.homeAboutBadgeText),
  featuredBg: img(h?.homeFeaturedBg ?? null),
});

const toSettings = (f: WpSettings | null, h: WpHome | null): HomeSettings => {
  const stats = (f?.stats ?? [])
    .filter((s) => s.count != null && s.label)
    .map((s) => ({ count: s.count!, label: s.label!, suffix: s.suffix ?? "" }));
  return {
    heroLines: (f?.heroLines ?? []).map((r) => r.line ?? "").filter(Boolean),
    heroSub: f?.heroSub ?? "",
    stats,
    marquee: wpLines(f?.marquee),
    contact: {
      email: f?.contactEmail?.trim() ?? "",
      whatsapp: f?.whatsappUrl?.trim() ?? "",
      instagram: f?.instagramUrl?.trim() ?? "",
      tiktok: f?.tiktokUrl?.trim() ?? "",
    },
    about: toAbout(h, stats),
  };
};

/** The home fields of "הגדרות אתר", the 8 newest deals, and the "main" tier partners (event-tier partners belong to event pages). */
export async function getHomeContent(): Promise<{ settings: HomeSettings; deals: Deal[]; sponsors: Sponsor[] }> {
  const data = await wpQuery<{
    siteSettings: { siteSettingsFields: WpSettings | null; homeContent: WpHome | null } | null;
    deals: { nodes: WpDeal[] };
    sponsors: { nodes: WpSponsor[] };
  }>(QUERY);
  return {
    settings: toSettings(data.siteSettings?.siteSettingsFields ?? null, data.siteSettings?.homeContent ?? null),
    // The 8 newest deals, newest first. byPublished breaks same-date ties by ID, which GraphQL's own order does not.
    deals: data.deals.nodes.sort(byPublished).reverse().slice(0, 8).map(toDeal),
    sponsors: data.sponsors.nodes
      .filter((s) => s.sponsorFields?.tier?.includes("main"))
      .sort(byPublished)
      .map(toSponsor),
  };
}

/** Just "יצירת קשר ורשתות" from "הגדרות אתר", for pages that need the channels and nothing else (/contact). */
export async function getContact(): Promise<Contact> {
  const data = await wpQuery<{
    siteSettings: { siteSettingsFields: Pick<WpSettings, "contactEmail" | "whatsappUrl" | "instagramUrl" | "tiktokUrl"> | null } | null;
  }>(`{ siteSettings { siteSettingsFields { contactEmail whatsappUrl instagramUrl tiktokUrl } } }`);
  const f = data.siteSettings?.siteSettingsFields;
  return {
    email: f?.contactEmail?.trim() ?? "",
    whatsapp: f?.whatsappUrl?.trim() ?? "",
    instagram: f?.instagramUrl?.trim() ?? "",
    tiktok: f?.tiktokUrl?.trim() ?? "",
  };
}
