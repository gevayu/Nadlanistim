import YouthTeam from "./YouthTeam";
import { getYouth } from "./wp";

export default async function YouthPage() {
  return <YouthTeam members={await getYouth()} />;
}
