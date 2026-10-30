// Sponsor strips from WordPress: "הגדרות אתר" → "חסויות" (mu-plugin wordpress/nadlanistim-fields.php).
// Each slot points at a "נותני חסות" post, which holds the name, logo and link.
import { wpQuery } from "../../lib/wp";

export type SponsorSlotName = "top" | "events";
export type SponsorSlot = { name: string; logo?: string; url?: string; text: string };
/** null = the slot is off or has no sponsor, so its strip is hidden. */
export type SponsorSlots = Record<SponsorSlotName, SponsorSlot | null>;

type WpSlot = {
  active: boolean | null;
  text: string | null;
  sponsor: {
    nodes: { title?: string; sponsorFields?: { websiteUrl: string | null; logo: { node: { sourceUrl: string } } | null } | null }[];
  } | null;
} | null;

const SLOT = `{ active text sponsor { nodes { ... on Sponsor { title sponsorFields { websiteUrl logo { node { sourceUrl } } } } } } }`;
const QUERY = `{ sponsorships { sponsorSlots { top: sponsorStripTop ${SLOT} events: sponsorStripEvents ${SLOT} } } }`;

const toSlot = (s: WpSlot): SponsorSlot | null => {
  const sp = s?.active ? s.sponsor?.nodes[0] : undefined;
  if (!sp?.title) return null;
  return {
    name: sp.title,
    logo: sp.sponsorFields?.logo?.node.sourceUrl,
    url: sp.sponsorFields?.websiteUrl || undefined,
    text: s?.text?.trim() ?? "",
  };
};

export async function getSponsorSlots(): Promise<SponsorSlots> {
  const data = await wpQuery<{ sponsorships: { sponsorSlots: { top: WpSlot; events: WpSlot } | null } | null }>(QUERY);
  const slots = data.sponsorships?.sponsorSlots;
  return { top: toSlot(slots?.top ?? null), events: toSlot(slots?.events ?? null) };
}
