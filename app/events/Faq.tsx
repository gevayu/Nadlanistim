import type { FaqItem } from "./data";
import "./faq.css";

/**
 * Event FAQ as an accordion: native <details>, so it opens by click or keyboard with no script.
 * A question WordPress has no answer for is a plain row, so nothing pretends to open.
 * `kind` picks the page's class prefix: ev (/event) or ep (/event-party).
 */
export default function Faq({ items, kind }: { items: FaqItem[]; kind: "ev" | "ep" }) {
  return (
    <div className={`${kind}-faq`}>
      {items.map(({ q, a }) =>
        a ? (
          <details key={q} className={`${kind}-faq__item ev-acc v6-glass`} data-reveal>
            <summary>
              <span className={`${kind}-faq__q`} aria-hidden>?</span>
              <span className="ev-acc__q">{q}</span>
              <svg className="ev-acc__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </summary>
            <p className="ev-acc__a">{a}</p>
          </details>
        ) : (
          <div key={q} className={`${kind}-faq__item v6-glass`} data-reveal>
            <span className={`${kind}-faq__q`} aria-hidden>?</span>
            {q}
          </div>
        ),
      )}
    </div>
  );
}
