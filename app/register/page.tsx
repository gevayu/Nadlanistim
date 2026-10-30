import { redirect } from "next/navigation";
import { getSession } from "../../lib/auth";
import AuthPage from "../login/AuthPage";
import { RegisterForm } from "../login/AuthForms";

export default async function RegisterPage() {
  if (await getSession()) redirect("/account");

  return (
    <AuthPage title="פתיחת" accent="חשבון" intro="החשבון מחבר אתכם לחברות ששילמתם עליה ולפרופיל שלכם במדריך הנדלניסטים.">
      <RegisterForm />
    </AuthPage>
  );
}
