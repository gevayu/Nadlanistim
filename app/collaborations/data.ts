export type Collab = {
  slug: string;
  title: string;
  looking: string;
  type: string;
  place: string;
  invest: string;
  stage: string;
  by: string;
  byRole: string;
  date: string;
  img: string; // WordPress featured image URL ("" = none); Unsplash photo id in the /account copy below
  tab?: string; // board tab key; unset counts as "looking"
  region?: string; // WordPress "אזור" term; otherwise read off the end of `place`
  description: string[];
  lookingList: string[];
  tags: string[];
  email: string;
  phone: string;
};

// WordPress select values -> the labels the site shows.
// The board shows only these tabs. WordPress also has "success" posts; the success-stories tab
// was removed from the site on purpose, so they stay off the board (their own page still works).
export const COLLAB_TABS: Record<string, string> = {
  looking: "מחפש שותף",
  active: "פרויקטים פעילים",
};
export const COLLAB_LOOKING: Record<string, string> = {
  financial: "שותף פיננסי",
  profession: "שותף מקצועי",
  contractor: "קבלן מבצע",
  proptech: "יועץ פרופטק",
  land: "שותף לקרקע",
  investor: "משקיע שותף",
};
export const COLLAB_INVEST: Record<string, string> = {
  "100k": "עד 100K",
  "500k": "עד 500K",
  "1m": "מיליון ₪ ומעלה",
  none: "ללא השקעה כספית",
};
export const COLLAB_STAGES: Record<string, string> = {
  idea: "רעיון ראשוני",
  permits: "תכנון והיתרים",
  building: "תכנון והקמה",
  exec: "ביצוע",
  advanced: "מוצר מתקדם",
};

export const collabTab = (c: Collab) => c.tab ?? "looking";
/** On the board (and its locked teaser): only posts in one of COLLAB_TABS. */
export const onBoard = (c: Collab) => collabTab(c) in COLLAB_TABS;
// "גבעת שמואל, מרכז" -> "מרכז"
export const collabRegion = (c: Collab) => c.region ?? c.place.split(",").at(-1)!.trim();
