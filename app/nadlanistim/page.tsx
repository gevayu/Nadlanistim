import { guard } from "@/lib/paywall";
import Directory from "./Directory";
import { publicCard } from "./data";
import { getNadlanistim } from "./wp";

export default async function NadlanistimPage() {
  await guard("directory", "/nadlanistim"); // "חומת תשלום" in WordPress; open to everyone unless set otherwise
  // Cards only: the full profiles are members-only and must not ride along in the page data.
  return <Directory people={(await getNadlanistim()).map(publicCard)} />;
}
