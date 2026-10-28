export type TeamMember = {
  slug: string;
  photo?: string; // WordPress featured image
  name: string;
  role: string;
  place: string;
  field: string; // category for the filter row
  oneLiner: string;
  bio: string[];
  focus: string[];
  quote: string;
  email: string;
};

// The team lives in WordPress only (youth/wp.ts). The member page names itself in the breadcrumbs (SiteShell `crumb`).

/** "יזם נדל״ן, 25 · תל אביב", skipping whichever part is empty. */
export const roleLine = (m: TeamMember) => [m.role, m.place].filter(Boolean).join(" · ");
