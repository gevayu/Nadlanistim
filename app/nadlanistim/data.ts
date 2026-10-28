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
};

// Choices for the member form (/my-account, /nadlanist-new) and the directory filters.
export const FIELDS = ["יזמות", "השקעות", "שיווק", "ייעוץ", "אדריכלות", "תיווך", "שמאות", "מימון", "פרופטק", "משפט"];
export const PLACES = ["תל אביב", "מרכז", "צפון", "דרום", "ירושלים", "כל הארץ"];

// The signed-in member. The site has no login yet; /profile, /account and /my-account are this member.
export const CURRENT_MEMBER = "avi-cohen";
