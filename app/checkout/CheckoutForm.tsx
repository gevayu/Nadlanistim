"use client";

import { useActionState, useState } from "react";
import type { Product } from "../../lib/store";
import { checkout, type CheckoutState } from "./actions";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MAX_QUANTITY = 10;
const shekels = (n: number) => `₪${n.toLocaleString("he-IL")}`;

export default function CheckoutForm({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [state, action, pending] = useActionState<CheckoutState, FormData>(checkout, {});
  const v = state.values;

  return (
    <div className="co-grid">
      <aside className="co-summary v6-glass" data-reveal>
        {product.image && <img className="co-summary__img" src={product.image} alt="" />}
        <h2 className="co-summary__name">{product.name}</h2>
        {product.note && <p className="co-summary__note">{product.note}</p>}

        <div className="co-row"><span>מחיר ליחידה</span><b>{shekels(product.price)}</b></div>
        {!product.soldIndividually && (
          <div className="co-row">
            <span id="co-qty-label">כמות</span>
            <div className="co-stepper" role="group" aria-labelledby="co-qty-label" dir="ltr">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="הקטנת הכמות">−</button>
              <output aria-live="polite">{qty}</output>
              <button type="button" onClick={() => setQty((q) => Math.min(MAX_QUANTITY, q + 1))} disabled={qty >= MAX_QUANTITY} aria-label="הגדלת הכמות">+</button>
            </div>
          </div>
        )}
        <div className="co-row co-row--total"><span>סה״כ לתשלום</span><b>{shekels(product.price * qty)}</b></div>
      </aside>

      <article className="pg-panel v6-glass co-panel" data-reveal>
        <form className="pg-form" action={action}>
          <h2>הפרטים שלכם</h2>
          <input type="hidden" name="product" value={product.id} />
          <input type="hidden" name="quantity" value={qty} />
          <div className="pg-formgrid">
            <div className="v6-field">
              <label htmlFor="co-first">שם פרטי</label>
              <input id="co-first" name="first_name" type="text" required autoComplete="given-name" defaultValue={v?.first_name} />
            </div>
            <div className="v6-field">
              <label htmlFor="co-last">שם משפחה</label>
              <input id="co-last" name="last_name" type="text" required autoComplete="family-name" defaultValue={v?.last_name} />
            </div>
            <div className="v6-field">
              <label htmlFor="co-email">אימייל</label>
              <input id="co-email" name="email" type="email" required autoComplete="email" placeholder="you@email.com" defaultValue={v?.email} />
            </div>
            <div className="v6-field">
              <label htmlFor="co-phone">טלפון</label>
              <input id="co-phone" name="phone" type="tel" required autoComplete="tel" placeholder="050-0000000" defaultValue={v?.phone} />
            </div>
          </div>

          {state.error && <p className="co-error" role="alert">{state.error}</p>}

          <button type="submit" className="v6-btn v6-btn--primary v6-btn--lg v6-btn--block" disabled={pending} data-magnetic="">
            <span>{pending ? "מעבירים לתשלום…" : "למעבר לתשלום מאובטח"}</span>
            <ArrowIcon />
          </button>
          <p className="co-secure">התשלום מתבצע בעמוד המאובטח של iCount.</p>
        </form>
      </article>
    </div>
  );
}
