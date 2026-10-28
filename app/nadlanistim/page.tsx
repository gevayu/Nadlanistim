import Directory from "./Directory";
import { getNadlanistim } from "./wp";

export default async function NadlanistimPage() {
  return <Directory people={await getNadlanistim()} />;
}
