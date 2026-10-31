import { guard } from "@/lib/paywall";
import ContactView from "./ContactView";
import { getContact } from "../v6/wp";

// The form posts like the homepage one; the channels beside it come from "הגדרות אתר" → "יצירת קשר ורשתות".
export default async function ContactPage() {
  await guard("contact", "/contact"); // "חומת תשלום" in WordPress; open to everyone unless set otherwise
  return <ContactView contact={await getContact()} />;
}
