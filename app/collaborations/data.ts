export type Collab = {
  slug: string;
  title: string;
  looking: string;
  type: string; // WordPress "סוג" term (nad_collab_type); the ACF text field until a term is set
  place: string;
  invest: string;
  stage: string;
  by: string;
  byRole: string;
  date: string;
  img: string; // WordPress featured image URL ("" = none); Unsplash photo id in the /account copy below
  tab?: string; // board tab key; unset counts as "looking"
  region?: string; // WordPress "אזור" term (nad_region)
  description: string[];
  lookingList: string[];
  tags: string[];
  email: string;
  phone: string;
};

/**
 * Board tab keys (WordPress "board_tab" values), in board order. The tab names come from WordPress.
 * WordPress also has "success" posts; the success-stories tab was removed from the site on purpose,
 * so they stay off the board (their own page still works).
 */
export const BOARD_TABS = ["looking", "active"];

/** A board tab: its WordPress key and the name WordPress gives it. */
export type CollabTab = { key: string; label: string };

export const collabTab = (c: Collab) => c.tab ?? "looking";
/** On the board (and its locked teaser): only posts in one of BOARD_TABS. */
export const onBoard = (c: Collab) => BOARD_TABS.includes(collabTab(c));
// The WordPress "אזור" term. A post nobody has tagged yet (a fresh form submission) falls back to the
// end of its place: "גבעת שמואל, מרכז" -> "מרכז".
export const collabRegion = (c: Collab) => c.region ?? c.place.split(",").at(-1)!.trim();
