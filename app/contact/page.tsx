import ContactView from "./ContactView";
import { getContact } from "../v6/wp";

// The form posts like the homepage one; the channels beside it come from "הגדרות אתר" → "יצירת קשר ורשתות".
export default async function ContactPage() {
  return <ContactView contact={await getContact()} />;
}
