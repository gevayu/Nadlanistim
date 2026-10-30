import LegalPage, { legalMeta } from "../LegalPage";

export const generateMetadata = () => legalMeta("accessibility");

export default function Page() {
  return <LegalPage slug="accessibility" />;
}
