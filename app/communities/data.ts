export type HappeningIcon = "calendar" | "chat" | "expert" | "deal";
export type Happening = { ic: HappeningIcon; t: string; d: string };

export type Community = {
  slug: string;
  name: string;
  tagline: string;
  members: string;
  cover: string; // image URL ("" when WordPress has none)
  about: string[];
  happenings: Happening[];
  gallery: string[]; // image URLs
  logo?: string;
  whatsapp?: string; // the community's WhatsApp group invite link
};

// A community without a logo in WordPress shows the shared badge from the homepage (Yuval's call).
export const DEFAULT_LOGO = "/community-badge.png";
export const communityLogo = (c: Community) => c.logo || DEFAULT_LOGO;
