import LegalPage, { legalMeta } from "../LegalPage";

export const generateMetadata = () => legalMeta("terms");

export default function Page() {
  return <LegalPage slug="terms" />;
}
