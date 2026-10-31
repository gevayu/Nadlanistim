import { notFound } from "next/navigation";
import SiteShell from "../v6/SiteShell";
import { getOrderSummary } from "../../lib/store";
import Celebrate from "./Celebrate";
import "../checkout/checkout.css";

const shekels = (n: number) => `₪${n.toLocaleString("he-IL")}`;
const PENDING = ["pending", "on-hold"];

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// After paying for membership, what happens next with the join application (order-summary's "membership").
const MEMBERSHIP: Record<"ok" | "pending" | "blocked" | "none", { text: string; cta?: [string, string] }> = {
  ok: { text: "החברות פעילה. אפשר להיכנס עכשיו לאזור האישי.", cta: ["/account", "לאזור האישי"] },
  none: { text: "התשלום נקלט, אבל עוד לא קיבלנו בקשת הצטרפות מהאימייל הזה. מלאו את טופס ההצטרפות, ואחרי האישור תוכלו להיכנס.", cta: ["/join#join-form", "לטופס ההצטרפות"] },
  pending: { text: "הבקשה שלכם ממתינה לאישור מנהלי הקהילה. כשהיא תאושר, נשלח לכם מייל." },
  blocked: { text: "החשבון הזה אינו פעיל. לפרטים כתבו לנו בעמוד צור קשר." },
};

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ order?: string; key?: string }> }) {
  const { order, key } = await searchParams;
  const s = order && key ? await getOrderSummary(order, key) : null;
  if (!s) notFound();

  if (!s.paid) {
    const pending = PENDING.includes(s.status);
    return (
      <SiteShell>
        <section className="v6-section">
          <div className="v6-container">
            <div className="pg-head" data-reveal>
              <h1>{pending ? "התשלום בבדיקה" : "התשלום לא הושלם"}</h1>
              {pending
                ? <p>הזמנה מס׳ {s.number} התקבלה וממתינה לאישור התשלום. אישור יישלח <span className="co-nowrap">ל-{s.email}</span> ברגע שהתשלום יעבור.</p>
                : <p>הזמנה מס׳ {s.number} לא שולמה.</p>}
            </div>
            <div className="pg-cta-row">
              <a href="/" className="v6-btn v6-btn--glass"><span>לדף הבית</span></a>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  const next = s.membership ? MEMBERSHIP[s.membership] : null;

  return (
    <SiteShell>
      <Celebrate />
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>{s.first_name ? <>תודה, <em>{s.first_name}</em>!</> : "תודה!"}</h1>
            <p>התשלום עבר. מספר הזמנה: {s.number}</p>
          </div>

          <article className="pg-panel v6-glass" style={{ maxWidth: 560 }} data-reveal>
            <div className="co-lines">
              {s.items.map((i, n) => (
                <div key={n} className="co-row">
                  <span>{i.name} <bdi>× {i.qty}</bdi></span>
                  <b>{shekels(i.total)}</b>
                </div>
              ))}
              <div className="co-row co-row--total"><span>סה״כ שולם</span><b>{shekels(s.total)}</b></div>
            </div>
            <p className="co-done">אישור נשלח <span className="co-nowrap">ל-<b>{s.email}</b></span></p>
          </article>

          {next && <div className="pg-sent" style={{ maxWidth: 560, marginTop: 20 }} data-reveal>{next.text}</div>}

          <div className="pg-cta-row">
            {next?.cta && <a href={next.cta[0]} className="v6-btn v6-btn--primary"><span>{next.cta[1]}</span><ArrowIcon /></a>}
            <a href="/" className="v6-btn v6-btn--glass"><span>לדף הבית</span></a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
