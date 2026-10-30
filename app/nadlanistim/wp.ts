// Nadlanistim directory from WordPress (nad_nadlanist + its "פרטי נדלניסט/ית" ACF group).
import { byPublished, wpLines, wpQuery } from "../../lib/wp";
import type { Nadlanist } from "./data";

type WpNadlanist = {
  databaseId: number;
  date: string;
  slug: string;
  title: string;
  featuredImage: { node: { sourceUrl: string } } | null;
  cohorts: { nodes: { name: string; slug: string }[] };
  nadlanistFields: {
    role: string | null;
    field: string[] | null;
    place: string | null;
    quote: string | null;
    bio: string | null;
    email: string | null;
  } | null;
  nadlanistExtra: {
    linkedin: string | null;
    instagram: string | null;
    openToWork: boolean | null;
    communities: { nodes: { slug: string }[] } | null;
  } | null;
};

const QUERY = `{ nadlanists(first: 100) { nodes {
  databaseId date slug title
  featuredImage { node { sourceUrl(size: MEDIUM_LARGE) } }
  cohorts { nodes { name slug } }
  nadlanistFields { role field place quote bio email }
  nadlanistExtra { linkedin instagram openToWork communities { nodes { slug } } }
} } }`;

// Members of this cohort belong to the youth team page, not the directory.
const YOUTH_COHORT = "צעירים";
// "שיוכים" term "הופעה בעמוד ראשי": editors tick it to put a member in the homepage carousel.
const HOMEPAGE_COHORT = "homepage";

const toNadlanist = ({ slug, title, featuredImage, cohorts, nadlanistFields: f, nadlanistExtra: x }: WpNadlanist): Nadlanist => ({
  slug,
  name: title,
  photo: featuredImage?.node.sourceUrl,
  role: f?.role ?? "",
  field: f?.field?.[0] ?? "",
  place: f?.place ?? "",
  quote: f?.quote ?? "",
  bio: wpLines(f?.bio),
  email: f?.email ?? "",
  homepage: cohorts.nodes.some((c) => c.slug === HOMEPAGE_COHORT),
  // "רשתות, חיפוש עבודה וקהילות" (mu-plugin nadlanistim-fields.php)
  linkedin: x?.linkedin || undefined,
  instagram: x?.instagram || undefined,
  openToWork: !!x?.openToWork,
  communities: x?.communities?.nodes.map((c) => c.slug) ?? [],
});

/** The directory (youth team excluded), oldest member first. */
export async function getNadlanistim(): Promise<Nadlanist[]> {
  const data = await wpQuery<{ nadlanists: { nodes: WpNadlanist[] } }>(QUERY);
  return data.nadlanists.nodes
    .filter((n) => !n.cohorts.nodes.some((c) => c.name === YOUTH_COHORT))
    .sort(byPublished)
    .map(toNadlanist);
}
