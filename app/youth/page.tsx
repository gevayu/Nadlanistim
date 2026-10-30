import YouthTeam from "./YouthTeam";
import { getYouth, getYouthSettings } from "./wp";

export default async function YouthPage() {
  const [members, settings] = await Promise.all([getYouth(), getYouthSettings()]);
  return <YouthTeam members={members} settings={settings} />;
}
