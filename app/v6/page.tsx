import HomePageV6 from "./HomeV6";
import { getCommunities } from "../communities/wp";

export default async function HomePage() {
  return <HomePageV6 communities={await getCommunities()} />;
}
