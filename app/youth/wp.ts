// Youth team from WordPress: nad_nadlanist posts in the "צעירים" cohort (same post type as the directory).
import { byPublished, wpLines, wpQuery } from "../../lib/wp";
import type { TeamMember } from "./data";

type WpMember = {
  databaseId: number;
  date: string;
  slug: string;
  title: string;
  featuredImage: { node: { sourceUrl: string } } | null;
  cohorts: { nodes: { name: string }[] };
  nadlanistFields: {
    role: string | null;
    field: string[] | null;
    age: number | null;
    place: string | null;
    oneLiner: string | null;
    quote: string | null;
    bio: string | null;
    focus: string | null;
    email: string | null;
  } | null;
};

const QUERY = `{ nadlanists(first: 100) { nodes {
  databaseId date slug title
  featuredImage { node { sourceUrl(size: MEDIUM_LARGE) } }
  cohorts { nodes { name } }
  nadlanistFields { role field age place oneLiner quote bio focus email }
} } }`;

const YOUTH_COHORT = "צעירים";

// The design shows the age inside the role line ("יזם נדל״ן, 25"). The seeded posts already have it typed
// into the role and leave `age` empty, so it is only appended when filled in and not already there.
const roleWithAge = (role: string, age: number | null) =>
  age && !role.endsWith(String(age)) ? `${role}, ${age}` : role;

const toMember = ({ slug, title, featuredImage, nadlanistFields: f }: WpMember): TeamMember => ({
  slug,
  name: title,
  photo: featuredImage?.node.sourceUrl,
  role: roleWithAge(f?.role ?? "", f?.age ?? null),
  place: f?.place ?? "",
  field: f?.field?.[0] ?? "",
  oneLiner: f?.oneLiner ?? "",
  bio: wpLines(f?.bio),
  focus: wpLines(f?.focus),
  quote: f?.quote ?? "",
  email: f?.email ?? "",
});

/** The youth team, oldest member first. */
export async function getYouth(): Promise<TeamMember[]> {
  const data = await wpQuery<{ nadlanists: { nodes: WpMember[] } }>(QUERY);
  return data.nadlanists.nodes
    .filter((n) => n.cohorts.nodes.some((c) => c.name === YOUTH_COHORT))
    .sort(byPublished)
    .map(toMember);
}

export type YouthSettings = { hero: string; heroSrcSet?: string; maxAge: number | null; intro: string };

/** "הגדרות אתר" → עמוד נבחרת הצעירים (mu-plugin nadlanistim-fields.php). */
export async function getYouthSettings(): Promise<YouthSettings> {
  const data = await wpQuery<{
    siteSettings: { youthSettings: { youthHero: { node: { sourceUrl: string; srcSet: string | null } } | null; youthMaxAge: number | null; youthIntro: string | null } | null } | null;
  }>(`{ siteSettings { youthSettings { youthHero { node { sourceUrl srcSet } } youthMaxAge youthIntro } } }`);
  const f = data.siteSettings?.youthSettings;
  return { hero: f?.youthHero?.node.sourceUrl ?? "", heroSrcSet: f?.youthHero?.node.srcSet ?? undefined, maxAge: f?.youthMaxAge ?? null, intro: f?.youthIntro ?? "" };
}
