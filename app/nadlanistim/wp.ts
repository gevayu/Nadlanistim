// Nadlanistim directory from WordPress (nad_nadlanist + its "פרטי נדלניסט/ית" ACF group).
import { byPublished, wpLines, wpQuery } from "../../lib/wp";
import { NADLANISTIM, type Nadlanist } from "./data";

type WpNadlanist = {
  databaseId: number;
  date: string;
  slug: string;
  title: string;
  featuredImage: { node: { sourceUrl: string } } | null;
  cohorts: { nodes: { name: string }[] };
  nadlanistFields: {
    role: string | null;
    field: string[] | null;
    place: string | null;
    quote: string | null;
    bio: string | null;
    email: string | null;
  } | null;
};

const QUERY = `{ nadlanists(first: 100) { nodes {
  databaseId date slug title
  featuredImage { node { sourceUrl(size: MEDIUM_LARGE) } }
  cohorts { nodes { name } }
  nadlanistFields { role field place quote bio email }
} } }`;

// Members of this cohort belong to the youth team page, not the directory.
const YOUTH_COHORT = "צעירים";

const toNadlanist = ({ slug, title, featuredImage, nadlanistFields: f }: WpNadlanist): Nadlanist => ({
  slug,
  name: title,
  photo: featuredImage?.node.sourceUrl,
  role: f?.role ?? "",
  field: f?.field?.[0] ?? "",
  place: f?.place ?? "",
  quote: f?.quote ?? "",
  bio: wpLines(f?.bio),
  email: f?.email ?? "",
  // ponytail: WordPress has no linkedin / instagram / open-to-work fields yet, so those stay off.
  // Upgrade: add them to group_nad_nadlanist in the importer plugin and map them here.
});

/** The directory (youth team excluded), oldest member first. Falls back to the local copy if the backend is down. */
export async function getNadlanistim(): Promise<Nadlanist[]> {
  const data = await wpQuery<{ nadlanists: { nodes: WpNadlanist[] } }>(QUERY);
  if (!data) return NADLANISTIM;
  return data.nadlanists.nodes
    .filter((n) => !n.cohorts.nodes.some((c) => c.name === YOUTH_COHORT))
    .sort(byPublished)
    .map(toNadlanist);
}
