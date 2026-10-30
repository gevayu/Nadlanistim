import AuthPage from "../login/AuthPage";
import { ForgotForm } from "../login/AuthForms";

// The email and the "new password" screen are WordPress's own (retrieve_password). Afterwards the member logs in here.
export default function ForgotPasswordPage() {
  return (
    <AuthPage title="איפוס" accent="סיסמה" intro="כתבו את האימייל של החשבון ונשלח אליו קישור לבחירת סיסמה חדשה.">
      <ForgotForm />
    </AuthPage>
  );
}
