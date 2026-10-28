import { redirect } from "next/navigation";
import { getJobs } from "../wp";

// WordPress links a job as /jobs/<slug> (its "View" button and the backend redirect).
// The site's job page lives at /job/<serial>, so forward there.
export default async function JobSlugRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeURIComponent((await params).slug);
  const job = (await getJobs()).find((j) => j.slug === slug);
  redirect(job ? `/job/${job.id}` : "/jobs");
}
