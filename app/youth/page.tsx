import { guard } from "@/lib/paywall";
import YouthTeam from "./YouthTeam";
import { getYouth, getYouthSettings } from "./wp";

export default async function YouthPage() {
  await guard("youth", "/youth"); // "חומת תשלום" in WordPress; open to everyone unless set otherwise
  const [members, settings] = await Promise.all([getYouth(), getYouthSettings()]);
  return <YouthTeam members={members} settings={settings} />;
}
