"use client";

import { useActionState } from "react";
import { forgotPassword, login, register, type AuthFormState } from "./actions";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Submit = ({ pending, label, busy }: { pending: boolean; label: string; busy: string }) => (
  <button type="submit" className="v6-btn v6-btn--primary v6-btn--lg v6-btn--block" disabled={pending} data-magnetic="">
    <span>{pending ? busy : label}</span>
    <ArrowIcon />
  </button>
);

const FormError = ({ text }: { text?: string }) => (text ? <p className="au-error" role="alert">{text}</p> : null);

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(login, {});
  return (
    <form className="pg-form" action={action}>
      {notice && <p className="au-note" role="status">{notice}</p>}
      <input type="hidden" name="next" value={next} />
      <div className="v6-field">
        <label htmlFor="au-email">אימייל</label>
        <input id="au-email" name="email" type="email" required autoComplete="email" placeholder="you@email.com" defaultValue={state.values?.email} />
      </div>
      <div className="v6-field">
        <label htmlFor="au-pass">סיסמה</label>
        <input id="au-pass" name="password" type="password" required autoComplete="current-password" />
      </div>
      <FormError text={state.error} />
      <Submit pending={pending} label="כניסה" busy="נכנסים…" />
      <div className="au-links">
        <a href="/forgot-password">שכחתם סיסמה?</a>
        <a href="/register">אין לכם חשבון? להרשמה</a>
      </div>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(register, {});
  return (
    <form className="pg-form" action={action}>
      <div className="v6-field">
        <label htmlFor="au-name">שם מלא</label>
        <input id="au-name" name="name" type="text" required maxLength={100} autoComplete="name" defaultValue={state.values?.name} />
      </div>
      <div className="v6-field">
        <label htmlFor="au-email">אימייל</label>
        <input id="au-email" name="email" type="email" required autoComplete="email" placeholder="you@email.com" defaultValue={state.values?.email} />
        <small className="au-hint">אותו אימייל שאיתו שילמתם על החברות.</small>
      </div>
      <div className="v6-field">
        <label htmlFor="au-pass">סיסמה</label>
        <input id="au-pass" name="password" type="password" required minLength={8} autoComplete="new-password" />
        <small className="au-hint">8 תווים לפחות.</small>
      </div>
      <FormError text={state.error} />
      <Submit pending={pending} label="פתיחת חשבון" busy="פותחים חשבון…" />
      <div className="au-links">
        <a href="/login">כבר יש לכם חשבון? לכניסה</a>
      </div>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(forgotPassword, {});
  if (state.sent) {
    return (
      <div className="pg-form">
        <p className="au-note" role="status">
          אם יש חשבון עם <bdi>{state.values?.email}</bdi>, הקישור כבר בדרך. לא הגיע תוך כמה דקות? בדקו בתיקיית הספאם.
        </p>
        <div className="au-links"><a href="/login">חזרה לכניסה</a></div>
      </div>
    );
  }
  return (
    <form className="pg-form" action={action}>
      <div className="v6-field">
        <label htmlFor="au-email">אימייל</label>
        <input id="au-email" name="email" type="email" required autoComplete="email" placeholder="you@email.com" defaultValue={state.values?.email} />
      </div>
      <FormError text={state.error} />
      <Submit pending={pending} label="שליחת קישור לאיפוס" busy="שולחים…" />
      <div className="au-links">
        <a href="/login">נזכרתם? לכניסה</a>
      </div>
    </form>
  );
}
