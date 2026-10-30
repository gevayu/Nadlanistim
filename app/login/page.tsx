import { redirect } from "next/navigation";
import { getSession, safeNext } from "../../lib/auth";
import AuthPage from "./AuthPage";
import { LoginForm } from "./AuthForms";

// ?verified= comes from the link in the sign-up email (wordpress/nadlanistim-auth.php, auth/verify).
const NOTICES: Record<string, string> = {
  "1": "האימייל אושר. התחברו כדי להמשיך.",
  "0": "הקישור לא תקין. התחברו ונשלח לכם קישור חדש.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; verified?: string }> }) {
  const { next: rawNext, verified } = await searchParams;
  const next = safeNext(rawNext);
  if (await getSession()) redirect(next);

  return (
    <AuthPage title="כניסה" accent="לחברים" intro="התחברו עם האימייל והסיסמה של החשבון שלכם באתר.">
      <LoginForm next={next} notice={verified ? NOTICES[verified] : undefined} />
    </AuthPage>
  );
}
