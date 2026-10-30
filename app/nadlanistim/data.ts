export type Nadlanist = {
  slug: string;
  name: string;
  role: string;
  field: string;
  place: string;
  quote: string;
  bio: string[];
  email: string;
  photo?: string; // WordPress featured image, or a data URL uploaded in /my-account
  phone?: string; // collected, never shown on the site
  linkedin?: string;
  instagram?: string;
  openToWork?: boolean; // green #OPENTOWORK ring around the avatar
  communities?: string[]; // slugs of the communities the member ticked in /my-account
  homepage?: boolean; // tagged "הופעה בעמוד ראשי": shown in the homepage quotes carousel
};

/**
 * What anyone may see of a nadlanist: the directory card. The rest of the profile (bio, contact, links)
 * is for paying members, so pages that render for everyone pass this, never the full record.
 */
export const publicCard = ({ slug, name, role, field, place, quote, photo, openToWork }: Nadlanist): Nadlanist =>
  ({ slug, name, role, field, place, quote, photo, openToWork, bio: [], email: "" });

// Choices for the member form (/my-account, /nadlanist-new) and the directory filters.
export const FIELDS = ["יזמות", "השקעות", "שיווק", "ייעוץ", "אדריכלות", "תיווך", "שמאות", "מימון", "פרופטק", "משפט"];
export const PLACES = ["תל אביב", "מרכז", "צפון", "דרום", "ירושלים", "כל הארץ"];

