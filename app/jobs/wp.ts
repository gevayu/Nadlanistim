// Jobs board listings from WordPress (nad_job + its "פרטי משרה" ACF group).
import { wpDate, wpLines, wpQuery } from "../../lib/wp";
import { JOBS, JOB_TYPES, type Job } from "./data";

type WpJob = {
  databaseId: number;
  slug: string;
  title: string;
  date: string;
  jobFields: {
    publisher: string | null;
    location: string | null;
    field: string[] | null;
    employment: string[] | null;
    description: string | null;
    requirements: string | null;
    tags: string | null;
    contactEmail: string | null;
  } | null;
};

const QUERY = `{ jobs(first: 100, where: { orderby: { field: DATE, order: DESC } }) { nodes {
  databaseId slug title date
  jobFields { publisher location field employment description requirements tags contactEmail }
} } }`;

const toJob = ({ databaseId, slug, title, date, jobFields: f }: WpJob): Job => ({
  // The WordPress post ID is the public serial: unique and never reused.
  id: databaseId,
  slug,
  // ponytail: WordPress has no offer/seek field yet, so every listing is an open position.
  // Upgrade: add a `kind` select to group_nad_job in the importer plugin and map it here.
  kind: "offer",
  title,
  by: f?.publisher ?? "",
  email: f?.contactEmail ?? "",
  type: JOB_TYPES[f?.employment?.[0] ?? ""] ?? "",
  place: f?.location ?? "",
  field: f?.field?.[0] ?? "",
  desc: f?.description ?? "",
  date: wpDate(date),
  reqs: wpLines(f?.requirements),
  tags: wpLines(f?.tags),
});

/** Live listings, newest first. Falls back to the local copy if the backend is down. */
export async function getJobs(): Promise<Job[]> {
  const data = await wpQuery<{ jobs: { nodes: WpJob[] } }>(QUERY);
  return data ? data.jobs.nodes.map(toJob) : JOBS;
}

export async function getJobById(id: number): Promise<Job | undefined> {
  return (await getJobs()).find((j) => j.id === id);
}
