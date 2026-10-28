import MyAccount from "./MyAccount";
import { getNadlanistim } from "../nadlanistim/wp";

export default async function MyAccountPage() {
  return <MyAccount people={await getNadlanistim()} />;
}
