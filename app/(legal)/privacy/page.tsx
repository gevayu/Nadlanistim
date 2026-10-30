import LegalPage, { legalMeta } from "../LegalPage";

export const generateMetadata = () => legalMeta("privacy");

export default function Page() {
  return <LegalPage slug="privacy" />;
}
