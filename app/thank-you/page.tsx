import { notFound } from "next/navigation";
import SiteShell from "../v6/SiteShell";
import { getOrderSummary } from "../../lib/store";
import Celebrate from "./Celebrate";
import "../checkout/checkout.css";

const shekels = (n: number) => `₪${n.toLocaleString("he-IL")}`;
const PENDING = ["pending", "on-hold"];

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

          <div className="pg-cta-row">
            <a href="/" className="v6-btn v6-btn--glass"><span>לדף הבית</span></a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
