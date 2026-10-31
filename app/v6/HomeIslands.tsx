"use client";

// The interactive parts of the home page. HomeV6 renders on the server and places these where they belong:
// the menu, the four carousels, the sign-up form and the page-wide effects (scroll reveal, parallax, magnetic
// buttons, stat counters). Only this file ships to the browser as code; the rest arrives as HTML.

import { useEffect, useRef, useState } from "react";
import { celebrate } from "./confetti";
import { sendHomeContact } from "../forms/actions";
import { FormError, Honeypot, useFormSend } from "../forms/FormParts";
import { ROLE_OPTIONS } from "../forms/options";
import { useMembersLink } from "./SiteHeader";
import { JOB_KINDS, type JobKind } from "../jobs/data";
import type { Nadlanist } from "../nadlanistim/data";
import LazyImg, { usePageLoaded } from "./LazyImg";
import { ArrowIcon, ChevronLeft, ChevronRight } from "./HomeIcons";

export type MemberCategory = { title: string; count: number; avatars: string[] };
export type JobOffer = { kind: JobKind; tag: string; title: string; company: string; location: string; desc: string; img: string; href?: string };
/** What the quote carousel shows of a directory member; the rest of the profile stays on the server. */
export type QuotedMember = Pick<Nadlanist, "slug" | "name" | "role" | "quote" | "photo" | "openToWork">;

const NAV_LINKS: [string, string][] = [
  ["#about", "מי אנחנו?"],
  ["/nadlanistim", "הכר את הנדלניסט"],
  ["#articles", "תוכן מקצועי"],
  ["#events", "אירועים"],
  ["#podcast", "פודקאסט"],
  ["#dealroom", "חדר העסקאות"],
  ["#stories", "קריירה"],
  ["/contact", "צרו קשר"],
];

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useRevealOnScroll() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".v6-root [data-reveal]")
    );
    // Stagger items by their index among data-reveal siblings (mirrors the
    // reference's per-parent stagger for grids/section heads).
    const byParent = new Map<Element, HTMLElement[]>();
    els.forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      const list = byParent.get(parent) ?? [];
      list.push(el);
      byParent.set(parent, list);
    });
    byParent.forEach((list) => {
      list.forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i, 8) * 0.06}s`;
      });
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}


function useParallax() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 761px)").matches) return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".v6-root [data-parallax]")
    );
    const heroImg = document.querySelector<HTMLElement>(".v6-hero__media img");
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      els.forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-parallax") || "0.2");
        const r = el.getBoundingClientRect();
        const progress = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0, ${(-progress * speed * 40).toFixed(1)}px, 0)`;
      });
      if (heroImg) {
        const sc = Math.min(1.12, 1 + Math.max(0, window.scrollY) / vh * 0.12);
        heroImg.style.transform = `scale(${sc.toFixed(3)})`;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
}

function useMagnetic() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (!window.matchMedia("(min-width: 761px)").matches) return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".v6-root [data-magnetic]")
    );
    const cleanups = els.map((el) => {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.2;
        const y = (e.clientY - r.top - r.height / 2) * 0.2;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      };
      const leave = () => {
        el.style.transform = "";
      };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      return () => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);
}

function useStatCounters() {
  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>(".v6-root [data-count]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const target = parseInt(el.dataset.count || "0", 10);
          const suffix = el.dataset.suffix || "";
          const duration = 2000;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.floor(eased * target).toLocaleString("en-US") + suffix;
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(el);
        });
      },
      { threshold: 0.3 }
    );
    counters.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);
}

/** The page-wide effects. Renders nothing; runs once the server HTML is in place. */
export function HomeEffects() {
  useRevealOnScroll();
  useStatCounters();
  useParallax();
  useMagnetic();
  return null;
}

/** Skip link, the top bar and the mobile drawer. */
export function HomeNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const members = useMembersLink();
  const scrolled = useScrolled();

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* Nav */}
      <a href="#main" className="v6-skip">דלג לתוכן</a>
      <header className={`v6-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="v6-nav__inner v6-glass">
          <button className="v6-nav__menu" aria-label="פתח תפריט" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}>
            <span /><span /><span />
          </button>
          <a href="#top" className="v6-nav__logo" aria-label="הנדלניסטים - דף הבית">
            <img src="/v6-assets/logo-360.png" width={360} height={114} alt="הנדלניסטים" />
          </a>
          <nav className="v6-nav__links" aria-label="ניווט ראשי">
            {NAV_LINKS.map(([href, label]) => (
              <a key={label} href={href}>{label}</a>
            ))}
          </nav>
          <a href={members.href} className="v6-btn v6-btn--primary v6-nav__cta" data-magnetic="">
            <span className="v6-nav__cta-long">{members.long}</span>
            <span className="v6-nav__cta-short">{members.short}</span>
            <ArrowIcon />
          </a>
        </div>
      </header>

      {/* Drawer (mobile) */}
      <div className={`v6-drawer${drawerOpen ? " is-open" : ""}`} aria-hidden={!drawerOpen}>
        <div className="v6-drawer__veil" onClick={closeDrawer} />
        <div className="v6-drawer__panel">
          <button className="v6-drawer__close" aria-label="סגור" onClick={closeDrawer}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
            </svg>
          </button>
          {NAV_LINKS.map(([href, label]) => (
            <a key={label} href={href} className="v6-drawer__link" onClick={closeDrawer}>{label}</a>
          ))}
          <a href={members.href} className="v6-btn v6-btn--primary v6-btn--lg v6-btn--block v6-drawer__cta" onClick={closeDrawer}>
            <span>{members.long}</span>
            <ArrowIcon />
          </a>
        </div>
      </div>
    </>
  );
}

export function MembersCarousel({ items }: { items: MemberCategory[] }) {
  // The avatars are CSS backgrounds, which never wait: they start once the page has loaded.
  const pageLoaded = usePageLoaded();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [rtl, setRtl] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const pausedRef = useRef(false);

  // Three identical copies give a buffer on both sides so the loop is seamless:
  // we ride the middle copy and snap back by exactly one copy whenever a move
  // crosses into a neighbour - invisibly, since every copy looks the same.
  const loop = [...items, ...items, ...items];

  // One-card step (card width + gap) and the width of a single copy.
  const measure = () => {
    const tr = trackRef.current;
    if (!tr) return { step: 0, setLen: 0 };
    const first = tr.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(tr).columnGap || "0") || 0;
    const step = first ? first.getBoundingClientRect().width + gap : 0;
    return { step, setLen: step * items.length };
  };

  const go = (dir: number) => {
    const { step } = measure();
    if (step === 0) return;
    setAnimate(true);
    setOffset((cur) => cur + dir * step);
  };

  // After each eased move settles, re-center into the middle copy without a
  // transition - the jump is invisible because the copies are identical.
  const onTransitionEnd = () => {
    const { setLen } = measure();
    if (setLen === 0) return;
    setAnimate(false);
    setOffset((cur) => {
      if (cur >= setLen * 2) return cur - setLen;
      if (cur < setLen) return cur + setLen;
      return cur;
    });
  };

  // Enable transform mode above mobile; keep native touch-scroll on small screens.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 761px)");
    const apply = () => {
      const on = mq.matches;
      setEnabled(on);
      const vp = viewportRef.current;
      if (vp) setRtl(getComputedStyle(vp).direction === "rtl");
      setAnimate(false);
      setOffset(on ? measure().setLen : 0);
    };
    apply();
    mq.addEventListener("change", apply);
    window.addEventListener("resize", apply);
    return () => {
      mq.removeEventListener("change", apply);
      window.removeEventListener("resize", apply);
    };
  }, []);

  // Gentle 5s auto-advance - eased via CSS transition, paused on hover.
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!pausedRef.current) go(1);
    }, 5000);
    return () => window.clearInterval(id);
  }, [enabled]);

  const rendered = enabled ? loop : items;
  const translate = enabled ? (rtl ? offset : -offset) : 0;

  return (
    <div
      className="v6-members-carousel"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <button
        type="button"
        className="v6-members__arrow v6-members__arrow--prev v6-glass"
        aria-label="הקטגוריה הקודמת"
        onClick={() => go(-1)}
      >
        <ChevronRight />
      </button>
      <div className="v6-members__viewport" ref={viewportRef}>
        <div
          className="v6-members__grid"
          ref={trackRef}
          onTransitionEnd={onTransitionEnd}
          style={{
            transform: `translate3d(${translate}px, 0, 0)`,
            transition: animate ? undefined : "none",
          }}
        >
          {rendered.map((m, i) => {
            // The loop renders three copies; only the middle one is reachable by keyboard and screen readers.
            const copy = enabled && (i < items.length || i >= 2 * items.length);
            return (
              <a
                key={`${m.title}-${i}`}
                href={`/nadlanistim?field=${encodeURIComponent(m.title)}`}
                className="v6-member v6-glass"
                aria-label={`${m.title}: ${m.count} נדלניסטים במדריך`}
                tabIndex={copy ? -1 : undefined}
                aria-hidden={copy || undefined}
              >
                <div className="v6-member__count">{m.count}</div>
                <h3>{m.title}</h3>
                <div className="v6-member__avatars" aria-hidden>
                  {m.avatars.map((a) => (
                    <span key={a} style={pageLoaded ? { backgroundImage: `url(${a})` } : undefined} />
                  ))}
                </div>
              </a>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        className="v6-members__arrow v6-members__arrow--next v6-glass"
        aria-label="הקטגוריה הבאה"
        onClick={() => go(1)}
      >
        <ChevronLeft />
      </button>
    </div>
  );
}

export function NadlanistCarousel({ people }: { people: QuotedMember[] }) {
  const [i, setI] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!pausedRef.current) setI((p) => (p + 1) % people.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [people.length]);

  const p = people[i];

  return (
    <article
      className="v6-story v6-story--lg v6-glass v6-meet"
      data-reveal
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <figure className="v6-story__img v6-meet__img">
        {p.photo && <LazyImg key={`meet-img-${i}`} src={p.photo} alt={p.name} />}
        {p.openToWork && <span className="v6-meet__otw">#OPENTOWORK</span>}
      </figure>
      <div className="v6-story__body">
        <span className="v6-meet__eyebrow"><span className="v6-dot" />הכר את הנדלניסט</span>
        <div className="v6-meet__slide" key={`meet-${i}`}>
          <blockquote>״{p.quote}״</blockquote>
          <div className="v6-story__by">
            <div>
              <div className="v6-story__name">{p.name}</div>
              <div className="v6-story__role">{p.role}</div>
            </div>
          </div>
        </div>
        <div className="v6-cardfoot">
          <a href={`/nadlanist/${p.slug}`} className="v6-btn v6-btn--glass v6-cardcta">לפרטים</a>
          <div className="v6-cardnav">
            <button type="button" className="v6-cardarrow" aria-label="הנדלניסט הקודם" onClick={() => setI((prev) => (prev - 1 + people.length) % people.length)}>
              <ChevronRight />
            </button>
            <div className="v6-carddots" aria-label="הנדלניסטים">
              {people.map((_, n) => (
                <button
                  key={n}
                  type="button"
                  className={`v6-carddot${n === i ? " is-active" : ""}`}
                  aria-label={`נדלניסט ${n + 1}`}
                  onClick={() => setI(n)}
                />
              ))}
            </div>
            <button type="button" className="v6-cardarrow" aria-label="הנדלניסט הבא" onClick={() => setI((prev) => (prev + 1) % people.length)}>
              <ChevronLeft />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function JobRotator({ jobs }: { jobs: JobOffer[] }) {
  const [i, setI] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!pausedRef.current) setI((p) => (p + 1) % jobs.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [jobs.length]);

  const j = jobs[i];

  return (
    <article
      className="v6-jobrot v6-glass"
      data-reveal
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      aria-label="הצעות עבודה בקהילה"
    >
      <figure className="v6-jobrot__img">
        {j.img && <LazyImg key={`job-img-${i}`} src={j.img} alt="" />}
        <span className="v6-jobrot__badge">{JOB_KINDS[j.kind]}</span>
      </figure>
      <div className="v6-jobrot__body">
        <div className="v6-jobrot__slide" key={`job-${i}`}>
          <span className="v6-jobrot__tag">{j.tag}</span>
          <h3>{j.title}</h3>
          <div className="v6-jobrot__meta">
            <span>{j.company}</span><span>·</span><span>{j.location}</span>
          </div>
          <p>{j.desc}</p>
        </div>
        <div className="v6-cardfoot">
          <a href={j.href ?? "/jobs"} className="v6-btn v6-btn--glass v6-cardcta">לפרטים</a>
          <div className="v6-cardnav">
            <button type="button" className="v6-cardarrow" aria-label="המשרה הקודמת" onClick={() => setI((prev) => (prev - 1 + jobs.length) % jobs.length)}>
              <ChevronRight />
            </button>
            <div className="v6-carddots">
              {jobs.map((_, n) => (
                <button
                  key={n}
                  type="button"
                  className={`v6-carddot${n === i ? " is-active" : ""}`}
                  aria-label={`משרה ${n + 1}`}
                  onClick={() => setI(n)}
                />
              ))}
            </div>
            <button type="button" className="v6-cardarrow" aria-label="המשרה הבאה" onClick={() => setI((prev) => (prev + 1) % jobs.length)}>
              <ChevronLeft />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function CommunitiesCarousel({ items }: { items: { id: string; logo: string; label: string; href: string }[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [rtl, setRtl] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const pausedRef = useRef(false);
  const loop = [...items, ...items, ...items];

  const measure = () => {
    const tr = trackRef.current;
    if (!tr) return { step: 0, setLen: 0 };
    const first = tr.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(tr).columnGap || "0") || 0;
    const step = first ? first.getBoundingClientRect().width + gap : 0;
    return { step, setLen: step * items.length };
  };

  const go = (dir: number) => {
    const { step } = measure();
    if (step === 0) return;
    setAnimate(true);
    setOffset((cur) => cur + dir * step);
  };

  const onTransitionEnd = () => {
    const { setLen } = measure();
    if (setLen === 0) return;
    setAnimate(false);
    setOffset((cur) => {
      if (cur >= setLen * 2) return cur - setLen;
      if (cur < setLen) return cur + setLen;
      return cur;
    });
  };

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 761px)");
    const apply = () => {
      const on = mq.matches;
      setEnabled(on);
      const vp = viewportRef.current;
      if (vp) setRtl(getComputedStyle(vp).direction === "rtl");
      setAnimate(false);
      setOffset(on ? measure().setLen : 0);
    };
    apply();
    mq.addEventListener("change", apply);
    window.addEventListener("resize", apply);
    return () => {
      mq.removeEventListener("change", apply);
      window.removeEventListener("resize", apply);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!pausedRef.current) go(1);
    }, 4000);
    return () => window.clearInterval(id);
  }, [enabled]);

  const rendered = enabled ? loop : items;
  const translate = enabled ? (rtl ? offset : -offset) : 0;

  return (
    <div
      className="v6-comm-carousel"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <button type="button" className="v6-members__arrow v6-members__arrow--prev v6-glass" aria-label="הקהילה הקודמת" onClick={() => go(-1)}>
        <ChevronRight />
      </button>
      <div className="v6-comm__viewport" ref={viewportRef}>
        <div
          className="v6-comm__track"
          ref={trackRef}
          onTransitionEnd={onTransitionEnd}
          style={{ transform: `translate3d(${translate}px, 0, 0)`, transition: animate ? undefined : "none" }}
        >
          {rendered.map((c, i) => (
            <a key={`${c.id}-${i}`} href={c.href} className="v6-comm">
              <div className="v6-comm__logo">{c.logo && <LazyImg src={c.logo} alt="" />}</div>
              <span className="v6-comm__label">{c.label}</span>
            </a>
          ))}
        </div>
      </div>
      <button type="button" className="v6-members__arrow v6-members__arrow--next v6-glass" aria-label="הקהילה הבאה" onClick={() => go(1)}>
        <ChevronLeft />
      </button>
    </div>
  );
}

/** "הרשמה לקהילה": sends to WordPress, confetti on success. */
export function HomeContactForm() {
  const contact = useFormSend(sendHomeContact);
  const sent = !!contact.state.ok;
  useEffect(() => {
    if (sent) celebrate();
  }, [sent]);
  return (
    <form
      className="v6-contact__form v6-glass"
      data-sent={sent || undefined}
      data-reveal
      onSubmit={contact.onSubmit}
    >
      <h3>הרשמה לקהילה</h3>
      <Honeypot />
      <div className="v6-field">
        <label htmlFor="f-name">שם מלא</label>
        <input id="f-name" name="name" type="text" required placeholder="ישראלה ישראלי" />
      </div>
      <div className="v6-field-row">
        <div className="v6-field">
          <label htmlFor="f-phone">טלפון</label>
          <input id="f-phone" name="phone" type="tel" required placeholder="050-0000000" />
        </div>
        <div className="v6-field">
          <label htmlFor="f-email">אימייל</label>
          <input id="f-email" name="email" type="email" required placeholder="you@company.com" />
        </div>
      </div>
      <div className="v6-field">
        <label htmlFor="f-role">תחום עיסוק</label>
        <select id="f-role" name="field" required defaultValue="">
          <option value="">בחרו תחום…</option>
          {ROLE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      {/* Two boxes, worded exactly as nadlanistim_consent_texts() records them: privacy is required, newsletters are a free choice. */}
      <label className="v6-contact__consent" htmlFor="f-consent">
        <input id="f-consent" name="consent" value="1" type="checkbox" required />
        <span>מוסכמת עלי <a href="/privacy" target="_blank" rel="noopener">מדיניות הפרטיות</a> של האתר, ושתשתמשו בפרטים כדי לחזור אליי לגבי ההצטרפות.</span>
      </label>
      <label className="v6-contact__consent" htmlFor="f-marketing">
        <input id="f-marketing" name="marketing" value="1" type="checkbox" />
        <span>אשמח לקבל דיוורים ועדכונים מהקהילה.</span>
      </label>
      <FormError error={contact.state.error} />
      <button type="submit" className="v6-btn v6-btn--primary v6-btn--block v6-btn--lg" disabled={contact.pending} data-magnetic="">
        <span>{contact.pending ? "שולחים…" : "שליחת בקשה"}</span>
        <ArrowIcon />
      </button>
      <div className="v6-contact__sent-msg">
        <strong>הבקשה נשלחה. ✓</strong>
        <span>נחזור אליך תוך 24 שעות.</span>
      </div>
    </form>
  );
}
