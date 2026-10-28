import JobsBoard from "./JobsBoard";
import { getJobs } from "./wp";

export default async function JobsPage() {
  return <JobsBoard jobs={await getJobs()} />;
}
