import MyAccount from "./MyAccount";
import { getCommunities } from "../communities/wp";
import { getNadlanistim } from "../nadlanistim/wp";

export default async function MyAccountPage() {
  const [people, communities] = await Promise.all([getNadlanistim(), getCommunities()]);
  return <MyAccount people={people} communities={communities.map(({ slug, name }) => ({ slug, name }))} />;
}
