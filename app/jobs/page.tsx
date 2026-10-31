import JobsBoard from "./JobsBoard";
import { getJobs } from "./wp";
import { guard } from "../../lib/paywall";

export default async function JobsPage() {
  // Open to everyone by default; "חומת תשלום" can send guests elsewhere.
  await guard("jobsBoard", "/jobs");
  return <JobsBoard jobs={await getJobs()} />;
}
