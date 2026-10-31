// Jobs board listings from WordPress (nad_job + its "פרטי משרה" ACF group).
import { wpDate, wpLines, wpQuery } from "../../lib/wp";
import { JOB_TYPES, type Job } from "./data";

type WpJob = {
  databaseId: number;
  slug: string;
  title: string;
  date: string;
  featuredImage: { node: { sourceUrl: string } } | null;
  jobFields: {
    tag: string | null;
    company: string | null;
    publisher: string | null;
    location: string | null;
    field: string[] | null;
    employment: string[] | null;
    description: string | null;
    requirements: string | null;
    tags: string | null;
    contactEmail: string | null;
  } | null;
  jobKind: { kind: string[] | null } | null;
};

const QUERY = `{ jobs(first: 100, where: { orderby: { field: DATE, order: DESC } }) { nodes {
  databaseId slug title date
  featuredImage { node { sourceUrl(size: MEDIUM_LARGE) } }
  jobFields { tag company publisher location field employment description requirements tags contactEmail }
  jobKind { kind }
} } }`;

const toJob = ({ databaseId, slug, title, date, featuredImage, jobFields: f, jobKind }: WpJob): Job => ({
  // The WordPress post ID is the public serial: unique and never reused.
  id: databaseId,
  slug,
  // "סוג פרסום" (mu-plugin nadlanistim-fields.php). Listings saved before the field existed are open positions.
  kind: jobKind?.kind?.[0] === "seek" ? "seek" : "offer",
  title,
  by: f?.publisher ?? "",
  email: f?.contactEmail ?? "",
  type: JOB_TYPES[f?.employment?.[0] ?? ""] ?? "",
  place: f?.location ?? "",
  field: f?.field?.[0] ?? "",
  desc: f?.description ?? "",
  date: wpDate(date),
  reqs: wpLines(f?.requirements),
  tag: f?.tag ?? undefined,
  company: f?.company ?? undefined,
  img: featuredImage?.node.sourceUrl,
  tags: wpLines(f?.tags),
});

/** Live listings, newest first. */
export async function getJobs(): Promise<Job[]> {
  const data = await wpQuery<{ jobs: { nodes: WpJob[] } }>(QUERY);
  return data.jobs.nodes.map(toJob);
}

export async function getJobById(id: number): Promise<Job | undefined> {
  return (await getJobs()).find((j) => j.id === id);
}
