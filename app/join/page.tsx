import JoinView from "./JoinView";
import { getMembershipPlans } from "../../lib/store";

export default async function JoinPage() {
  // Plans are live (no cache). If the store is down, the page still serves the application form, without plans.
  const plans = await getMembershipPlans().catch((e) => {
    console.error(e);
    return [];
  });
  return <JoinView plans={plans} />;
}
