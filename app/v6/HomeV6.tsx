"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { celebrate } from "./confetti";
import { sendHomeContact } from "../forms/actions";
import { FormError, Honeypot, useFormSend } from "../forms/FormParts";
import { ROLE_OPTIONS } from "../forms/options";
import SponsorStrip from "./SponsorStrip";
import SiteFooter from "./SiteFooter";
import { useMembersLink } from "./SiteHeader";
import type { Community } from "../communities/data";
import { JOB_KINDS, type Job, type JobKind } from "../jobs/data";
import type { Nadlanist } from "../nadlanistim/data";
import { eventHref, featuredEvent, isVolunteer, splitTitle, type EventItem } from "../events/data";
import type { Deal, HomeSettings, Sponsor } from "./wp";
import type { Article } from "../post-archive/data";
import type { Episode } from "../podcast/data";
import "./v6.css";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export type MemberCategory = { title: string; count: number; avatars: string[] };
type JobOffer = { kind: JobKind; tag: string; title: string; company: string; location: string; desc: string; img: string; href?: string };

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

// Stat bars step down card by card; a visual rhythm, not a measure of the number above them.
const STAT_BAR_WIDTHS = ["96%", "78%", "62%", "46%"];




// Homepage career card from a WordPress listing: first paragraph only, linking to the listing.
const toJobOffer = (j: Job): JobOffer => ({
  kind: j.kind,
  tag: j.tag ?? "",
  title: j.title,
  company: j.company || j.by,
  location: j.place,
  desc: j.desc.split(/\n+/)[0],
  img: j.img ?? "",
  href: `/job/${j.id}`,
});

// Event cards: date badge and the month line read the ISO date WordPress stores.
const heMonth = (iso: string) => new Intl.DateTimeFormat("he-IL", { month: "long", timeZone: "UTC" }).format(new Date(iso));
const heDay = (iso: string) => iso.slice(8, 10);
const heMonthYear = (iso: string) => `${heMonth(iso)} ${iso.slice(0, 4)}`;

// The communities carousel shows the real sub-communities, each linking to its own page.
const carouselItems = (communities: Community[]) =>
  communities.map((c) => ({
    id: c.slug,
    logo: c.logo ?? "",
    label: c.name,
    href: `/community/${c.slug}`,
  }));










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

function MembersCarousel({ items }: { items: MemberCategory[] }) {
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
                    <span key={a} style={{ backgroundImage: `url(${a})` }} />
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

function NadlanistCarousel({ people }: { people: Nadlanist[] }) {
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
        {p.photo && <img loading="lazy" key={`meet-img-${i}`} src={p.photo} alt={p.name} />}
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

function JobRotator({ jobs }: { jobs: JobOffer[] }) {
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
        {j.img && <img loading="lazy" key={`job-img-${i}`} src={j.img} alt="" />}
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

function CommunitiesCarousel({ items }: { items: { id: string; logo: string; label: string; href: string }[] }) {
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
              <div className="v6-comm__logo">{c.logo && <img loading="lazy" src={c.logo} alt="" />}</div>
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

type HomeProps = {
  communities: Community[];
  jobs: Job[];
  events: EventItem[];
  people: Nadlanist[]; // the nadlanistim directory
  categories: MemberCategory[]; // "חברי הקהילה", largest field first
  youth: { count: number; maxAge: number | null }; // banner for the youth team page
  articles: Article[]; // newest first
  episodes: Episode[]; // most recent episode first
  home: { settings: HomeSettings; deals: Deal[]; sponsors: Sponsor[] };
};

export default function HomePageV6({ communities, jobs, events, people, categories, youth, articles, episodes, home }: HomeProps) {
  const jobOffers = jobs.slice(0, 4).map(toJobOffer);
  const quoted = people.filter((n) => n.homepage && n.quote);
  const memberCats = categories;
  const { settings, deals, sponsors } = home;
  // "הגדרות אתר" → "עמוד הבית: תמונות ו"מי אנחנו"". Each part shows only when its field is filled.
  const about = settings.about;
  const heroMobile = about.heroSrcSet.split(",").map((s) => s.trim().split(" ")).find(([, w]) => w === "1536w")?.[0];
  const hasAbout = about.title.length > 0 || about.paragraphs.length > 0 || about.points.length > 0 || !!about.imageLarge || !!about.imageSmall;
  const c = settings.contact;
  const channels = [c.whatsapp, c.instagram, c.tiktok, c.email].filter(Boolean);
  const byDate = (a: EventItem, b: EventItem) => a.date.localeCompare(b.date);
  const upcoming = events.filter((e) => !e.past && !isVolunteer(e)).sort(byDate).slice(0, 3);
  const past = events.filter((e) => e.past && !isVolunteer(e)).sort(byDate).reverse().slice(0, 3);
  const featured = featuredEvent(events);
  const leadArticle = articles.find((a) => a.featured) ?? articles[0];
  const moreArticles = articles.filter((a) => a !== leadArticle).slice(0, 3);
  // Headline on two lines with the second highlighted: the part after " - ", else the last word.
  const [featuredMain, featuredAccent] = ((t) =>
    t.includes(" - ") ? splitTitle(t) : [t.slice(0, t.lastIndexOf(" ")), t.slice(t.lastIndexOf(" ") + 1)])(featured?.title ?? "");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const members = useMembersLink();
  const contact = useFormSend(sendHomeContact);
  const sent = !!contact.state.ok;
  useEffect(() => {
    if (sent) celebrate();
  }, [sent]);
  const scrolled = useScrolled();
  useRevealOnScroll();
  useStatCounters();
  useParallax();
  useMagnetic();

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
    <div className="v6-root">
      <div className="v6-ambient" aria-hidden>
        <div className="v6-ambient__orb v6-ambient__orb--1" />
        <div className="v6-ambient__orb v6-ambient__orb--2" />
        <div className="v6-ambient__orb v6-ambient__orb--3" />
        <div className="v6-ambient__grain" />
      </div>

      {/* Nav */}
      <a href="#main" className="v6-skip">דלג לתוכן</a>
      <header className={`v6-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="v6-nav__inner v6-glass">
          <button className="v6-nav__menu" aria-label="פתח תפריט" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}>
            <span /><span /><span />
          </button>
          <a href="#top" className="v6-nav__logo" aria-label="הנדלניסטים - דף הבית">
            <img src="/v6-assets/logo.png" alt="הנדלניסטים" />
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

      <main id="main">
      {/* Hero */}
      <section className="v6-hero" id="top">
        <div className="v6-hero__media" data-parallax="0.3">
          {about.heroImage && (
            // The hero is cropped to cover the screen, so a phone shows it about 1100px wide: the 1536px copy
            // (a third of the original's weight) is enough under the dark veil. Wider screens choose from all sizes.
            <picture>
              {heroMobile && <source media="(max-width: 760px)" srcSet={heroMobile} />}
              <img fetchPriority="high" src={about.heroImage} srcSet={about.heroSrcSet || undefined} sizes="100vw" alt="" />
            </picture>
          )}
          <div className="v6-hero__veil" />
        </div>
        <div className="v6-hero__glow" aria-hidden />

        <div className="v6-hero__content">
          {/* "הגדרות אתר" → כותרת ראשית: one line per row; the last row gets the highlight. */}
          <h1 className="v6-hero__title">
            {settings.heroLines.map((line, i) => (
              <span key={i} className="v6-line"><span>{i === settings.heroLines.length - 1 ? <em>{line}</em> : line}</span></span>
            ))}
          </h1>
          {settings.heroSub && <p className="v6-hero__sub">{settings.heroSub}</p>}
          <div className="v6-hero__cta">
            <a href="/join" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic="">
              <span>הצטרפו לקהילה</span>
              <ArrowIcon />
            </a>
            <a href="#events" className="v6-btn v6-btn--glass v6-btn--lg" data-magnetic="">
              <span>האירועים הקרובים</span>
            </a>
          </div>
        </div>

        <div className="v6-hero__bottom">
          <div className="v6-hero__scroll">
            <span>גלילה</span>
            <span className="v6-hero__scroll-line" />
          </div>
          <div className="v6-hero__caption">
            <span className="v6-hero__caption-num">01 / 13</span>
            <span>כנס הנדלניסטים השנתי · תל אביב</span>
          </div>
        </div>

        {settings.marquee.length > 0 && <div className="v6-marquee" aria-hidden>
          <div className="v6-marquee__track">
            {[...settings.marquee, ...settings.marquee].map((term, i) => (
              <Fragment key={i}>
                <span>{term}</span>
                <span className="v6-diamond">◆</span>
              </Fragment>
            ))}
          </div>
        </div>}
      </section>

      <SponsorStrip />

      {/* Stats */}
      {settings.stats.length > 0 && <section className="v6-section">
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--stats" data-reveal>
            <span className="v6-eyebrow"><span className="v6-dot" />הקהילה במספרים</span>
            <h2>קהילה גדולה. <em>השפעה אמיתית.</em></h2>
          </header>
          <div className="v6-stats__grid">
            {settings.stats.map((s, i) => (
              <div key={s.label} className="v6-stat v6-glass" data-reveal>
                <div className="v6-stat__num" data-count={s.count} data-suffix={s.suffix}>0{s.suffix}</div>
                <div className="v6-stat__label">{s.label}</div>
                <div className="v6-stat__bar">
                  <span style={{ ["--w" as never]: STAT_BAR_WIDTHS[i % STAT_BAR_WIDTHS.length] } as React.CSSProperties} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* About */}
      {hasAbout && (
      <section className="v6-section" id="about">
        <div className="v6-container">
          <div className="v6-about__grid">
            <div className="v6-about__text">
              <span className="v6-eyebrow" data-reveal><span className="v6-dot" />מי אנחנו</span>
              {about.title.length > 0 && (
                <h2 data-reveal>
                  {about.title.map((line, i) => (
                    <Fragment key={i}>
                      {i === about.title.length - 1 ? <em>{line}</em> : <>{line}<br /></>}
                    </Fragment>
                  ))}
                </h2>
              )}
              {about.paragraphs.map((p, i) => (
                <p key={i} data-reveal>{p}</p>
              ))}
              {about.points.length > 0 && (
                <ul className="v6-about__list" data-reveal>
                  {about.points.map((text, i) => (
                    <li key={i}><span>{String(i + 1).padStart(2, "0")}</span>{text}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="v6-about__media" data-reveal>
              {about.imageLarge && (
                <figure className="v6-about__img v6-about__img--lg" data-parallax="0.1">
                  <img loading="lazy" src={about.imageLarge} alt="" />
                </figure>
              )}
              {about.imageSmall && (
                <figure className="v6-about__img v6-about__img--sm" data-parallax="0.2">
                  <img loading="lazy" src={about.imageSmall} alt="" />
                </figure>
              )}
              {about.badgeNumber != null && (
                <div className="v6-about__badge v6-glass">
                  <div className="v6-about__badge-num">{about.badgeNumber}</div>
                  <div className="v6-about__badge-text">
                    {about.badgeText.map((line, i) => <Fragment key={i}>{i > 0 && <br />}{line}</Fragment>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Communities */}
      <section className="v6-section" id="communities">
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--comm" data-reveal>
            <h2>הקהילות של <em>הנדלניסטים</em></h2>
          </header>
          <CommunitiesCarousel items={carouselItems(communities)} />
        </div>
      </section>

      {/* Members */}
      <section className="v6-section" id="members">
        <div className="v6-container">
          <header className="v6-section-head" data-reveal>
            <span className="v6-eyebrow"><span className="v6-dot" />חברי הקהילה</span>
            <h2>הערך הוא <em>האנשים</em>.</h2>
            <p className="v6-section-head__sub">{categories.length} עולמות מקצועיים. {categories.reduce((n, c) => n + c.count, 0)} אנשי מקצוע. גג אחד.</p>
          </header>
          <MembersCarousel items={memberCats} />
        </div>
      </section>

      {/* Meet the Nadlanist: quotes from the directory ("הכר את הנדלניסט") */}
      {quoted.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <NadlanistCarousel people={quoted} />
          </div>
        </section>
      )}

      {/* Events (duplicate, above Stories) */}
      {upcoming.length > 0 && (
      <section className="v6-section" id="events">
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--row" data-reveal>
            <div>
              <span className="v6-eyebrow"><span className="v6-dot" />אירועים קרובים</span>
              <h2>אירועי נדלניסטים <em>הקרובים</em></h2>
            </div>
            <a href="/events" className="v6-link-arrow">
              <span>כל האירועים</span>
              <ArrowIcon />
            </a>
          </header>
          <div className="v6-events__list">
            {upcoming.map((e) => (
              <a key={e.slug} href={eventHref(e)} className="v6-event v6-glass" data-reveal>
                <div className="v6-event__date">
                  <span className="v6-event__day">{heDay(e.date)}</span>
                  <span className="v6-event__month">{heMonth(e.date)}</span>
                </div>
                <div className="v6-event__body">
                  <span className={`v6-event__tag${e.accent ? " v6-event__tag--accent" : ""}`}>{e.types[0]}</span>
                  <h3>{e.title}</h3>
                  <p>{e.desc}</p>
                  <div className="v6-event__meta">
                    <span>{e.place}</span><span>·</span><span>{e.time}</span>
                  </div>
                </div>
                <span className="v6-event__cta">
                  <span>הירשמו</span>
                  <ArrowIcon />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Featured event */}
      {featured && (
      <section className="v6-featured" id="featured">
        <div className="v6-featured__bg" data-parallax="0.25">
          {about.featuredBg && <img loading="lazy" src={about.featuredBg} alt="" />}
        </div>
        <div className="v6-container v6-featured__grid">
          <div className="v6-featured__text">
            <span className="v6-eyebrow" data-reveal><span className="v6-dot" />האירוע המרכזי</span>
            <div className="v6-featured__date" data-reveal>
              <div><span>{heDay(featured?.date ?? "")}</span>{featured && heMonth(featured.date)}</div>
              <div className="v6-featured__date-sep" />
              <div><span>{featured?.date.slice(0, 4)}</span>{featured?.place.split(",")[0]}</div>
            </div>
            <h2 className="v6-featured__title" data-reveal>
              {featuredMain}{featuredAccent && <><br /><em>{featuredAccent}</em></>}
            </h2>
            <p className="v6-featured__desc" data-reveal>{featured?.desc}</p>
            <div className="v6-featured__cta" data-reveal>
              <a href={featured?.cta || (featured ? eventHref(featured) : "/events")} className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic="">
                <span>הירשמו לכנס</span>
                <ArrowIcon />
              </a>
              <a href={featured ? eventHref(featured) : "/events"} className="v6-btn v6-btn--glass v6-btn--lg" data-magnetic="">תוכנית הכנס</a>
              <a href={past[0] ? eventHref(past[0]) : "/events"} className="v6-btn v6-btn--glass v6-btn--lg" data-magnetic="">תמונות מהכנס שעבר</a>
            </div>
          </div>
          <aside className="v6-featured__card v6-glass" data-reveal>
            <div className="v6-featured__card-img">
              {featured?.img && <img loading="lazy" src={featured.img} alt="" />}
            </div>
            <div className="v6-featured__card-body">
              {([["מיקום", featured?.place], ["שעות", featured?.time], ["מחיר", featured?.price], ["למי", featured?.audience]] as const)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                <div key={k} className="v6-featured__card-row">
                  <span>{k}</span><strong>{v}</strong>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
      )}

      {/* Deal room (Projects) */}
      <section className="v6-section" id="dealroom">
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--row" data-reveal>
            <div>
              <span className="v6-eyebrow"><span className="v6-dot" />פרויקטים ושיתופי פעולה</span>
              <h2>חדר <em>עסקאות.</em> <span className="v6-tag-members">Members Only</span></h2>
              <p className="v6-section-head__sub">פרויקטים, עסקאות ושיתופי פעולה שנולדו בתוך הקהילה.</p>
            </div>
            <a href="/collaborations" className="v6-link-arrow">
              <span>כל ההצעות</span>
              <ArrowIcon />
            </a>
          </header>
          <div className="v6-projects__grid">
            {deals.map((p) => (
              <a key={p.title} href={p.href} className="v6-project v6-glass" data-reveal>
                <figure className="v6-project__img">
                  {p.img && <img loading="lazy" src={p.img} alt="" />}
                  <div className="v6-project__tag">{p.tag}</div>
                  <span className="v6-project__members">Members Only</span>
                </figure>
                <div className="v6-project__body">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <div className="v6-project__meta">
                    <span>{p.period}</span><span>·</span><span>{p.partners}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <SponsorStrip slot="events" />

      {/* Sponsors */}
      <section className="v6-section">
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--center" data-reveal>
            <span className="v6-eyebrow"><span className="v6-dot" />שותפים</span>
            <h2>מיוצגים <em>בקהילה</em></h2>
          </header>
          <div className="v6-sponsors__group" data-reveal>
            <h4 className="v6-sponsors__title">שותפים קבועים</h4>
            <div className="v6-sponsors__logos">
              {sponsors.map((s) => {
                const mark = s.logo ? <img loading="lazy" src={s.logo} alt={s.name} className="v6-sponsors__img" /> : s.name;
                return s.url
                  ? <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="v6-sponsors__logo">{mark}</a>
                  : <div key={s.name} className="v6-sponsors__logo">{mark}</div>;
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Young Nadlanistim feature banner */}
      <section className="v6-section">
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--nowrap" data-reveal>
            <span className="v6-eyebrow"><span className="v6-dot" />פרויקט מיוחד</span>
            <h2>נבחרת הנדלניסטים הצעירים</h2>
          </header>
          <div className="v6-youth" data-reveal>
            <div className="v6-youth__bg">
              <img loading="lazy" src="/group-people-new-year-s-party.jpg" alt="" />
            </div>
            <div className="v6-youth__content">
              <p>{youth.count} נדלניסטים ונדלניסטיות{youth.maxAge ? ` מתחת לגיל ${youth.maxAge}` : ""} שעוד יכבשו את עולם הנדל״ן של ישראל!</p>
              <a href="/youth" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic="">
                <span>צפו בפרויקט המיוחד</span>
                <ArrowIcon />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="v6-section" id="articles">
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--row" data-reveal>
            <div>
              <span className="v6-eyebrow"><span className="v6-dot" />תוכן מקצועי</span>
              <h2>חברי הקהילה <em>כותבים</em></h2>
            </div>
            <a href="/post-archive" className="v6-link-arrow">
              <span>כל הכתבות</span>
              <ArrowIcon />
            </a>
          </header>
          <div className="v6-articles__grid">
            {leadArticle && (
              <a href={`/article/${leadArticle.slug}`} className="v6-article v6-article--feature v6-glass" data-reveal>
                <figure className="v6-article__img">
                  {leadArticle.img && <img loading="lazy" src={leadArticle.img} alt="" />}
                </figure>
                <div className="v6-article__body">
                  <div className="v6-article__cat">{leadArticle.cats[0]}</div>
                  <h3>{leadArticle.title}</h3>
                  <p>{leadArticle.excerpt}</p>
                  <div className="v6-article__meta">
                    <span>{leadArticle.author.name}</span><span>·</span><span>{leadArticle.minutes} דק׳ קריאה</span><span>·</span><span>{leadArticle.date}</span>
                  </div>
                </div>
              </a>
            )}
            {moreArticles.map((a) => (
              <a key={a.slug} href={`/article/${a.slug}`} className="v6-article v6-glass" data-reveal>
                <div className="v6-article__cat">{a.cats[0]}</div>
                <h3>{a.title}</h3>
                <p className="v6-article__excerpt">{a.excerpt}</p>
                <div className="v6-article__meta">
                  <span>{a.author.name}</span><span>·</span><span>{a.minutes} דק׳</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Nadlpodcast */}
      <section className="v6-section" id="podcast">
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--row" data-reveal>
            <div>
              <span className="v6-eyebrow"><span className="v6-dot" />נדלפודקאסט</span>
              <h2>הפרקים הכי <em>נצפים</em></h2>
              <p className="v6-section-head__sub">שיחות עומק עם האנשים שמזיזים את שוק הנדל״ן בישראל.</p>
            </div>
            <a href="/podcast" className="v6-link-arrow">
              <span>כל הפרקים</span>
              <ArrowIcon />
            </a>
          </header>
          <div className="v6-podcasts__grid">
            {episodes.slice(0, 4).map((p) => (
              <a key={p.slug} href={`/podcast/${p.slug}`} className="v6-podcast v6-glass" data-reveal>
                <figure className="v6-podcast__img">
                  {p.img && <img loading="lazy" src={p.img} alt="" />}
                </figure>
                <div className="v6-podcast__body">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <span className="v6-link-arrow v6-podcast__cta">
                    <span>לשמיעה</span>
                    <ArrowIcon />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Past events. "/#events" (hero, menu, footer) lands on the upcoming ones above; with none, here. */}
      <section className="v6-section" id={upcoming.length > 0 ? "past-events" : "events"}>
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--row" data-reveal>
            <div>
              <span className="v6-eyebrow"><span className="v6-dot" />אירועי עבר</span>
              <h2>חוזרים <em>לרגעים היפים.</em></h2>
            </div>
            <a href="/events" className="v6-link-arrow">
              <span>כל האירועים</span>
              <ArrowIcon />
            </a>
          </header>
          <div className="v6-events__list">
            {past.map((e) => (
              <a key={e.slug} href={eventHref(e)} className="v6-event v6-event--nodate v6-glass" data-reveal>
                <div className="v6-event__body">
                  <span className="v6-event__tag">{e.types[0]}</span>
                  <h3>{e.title}</h3>
                  <p>{e.desc}</p>
                  <div className="v6-event__meta">
                    <span>{e.place}</span><span>·</span><span>{heMonthYear(e.date)}</span>
                  </div>
                </div>
                <span className="v6-event__cta">
                  <span>לתמונות</span>
                  <ArrowIcon />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      {jobOffers.length > 0 && (
      <section className="v6-section" id="stories">
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--center v6-section-head--nowrap" data-reveal>
            <span className="v6-eyebrow"><span className="v6-dot" />לוח דרושים</span>
            <h2>קריירה</h2>
          </header>
          <div className="v6-stories__grid">
            <JobRotator jobs={jobOffers} />
          </div>
        </div>
      </section>
      )}

      {/* Contact */}
      <section className="v6-section v6-contact" id="contact">
        <div className="v6-contact__glow" aria-hidden />
        <div className="v6-container v6-contact__grid">
          <div className="v6-contact__text">
            <span className="v6-eyebrow" data-reveal><span className="v6-dot" />הצטרפו אלינו</span>
            <h2 data-reveal>
              בואו להיות חלק<br />
              <em>מהקהילה שמזיזה</em><br />
              את ענף הנדל״ן.
            </h2>
            <p data-reveal>
              השאירו פרטים ואנחנו נחזור אליכם תוך 24 שעות עם פרטים על
              תהליך ההצטרפות, החברות והאירועים הקרובים.
            </p>
            {channels.length > 0 && <div className="v6-contact__channels" data-reveal>
              {c.whatsapp && <a href={c.whatsapp} target="_blank" rel="noopener noreferrer" className="v6-contact__channel v6-glass" data-magnetic="">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2.6-1.3a.8.8 0 0 0-.9.1l-1.2 1.2c-1.9-.9-3.4-2.4-4.3-4.3l1.2-1.2a.8.8 0 0 0 .1-.9L8.5 5.4a.8.8 0 0 0-.9-.4l-2.3.6a.8.8 0 0 0-.6.8c0 5.9 4.8 10.7 10.7 10.7a.8.8 0 0 0 .8-.6l.6-2.3a.8.8 0 0 0-.4-.9z" /></svg>
                <span>וואטסאפ</span>
              </a>}
              {c.instagram && <a href={c.instagram} target="_blank" rel="noopener noreferrer" className="v6-contact__channel v6-glass" data-magnetic="">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
                <span>אינסטגרם</span>
              </a>}
              {c.tiktok && <a href={c.tiktok} target="_blank" rel="noopener noreferrer" className="v6-contact__channel v6-glass" data-magnetic="">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3a5 5 0 0 0 4 4.2v3a8 8 0 0 1-4-1.2v5.6a6 6 0 1 1-6-6c.34 0 .67.03 1 .08v3.18a3 3 0 1 0 2 2.82V3h3z" /></svg>
                <span>טיקטוק</span>
              </a>}
              {c.email && <a href={`mailto:${c.email}`} className="v6-contact__channel v6-glass" data-magnetic="">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
                <span>אימייל</span>
              </a>}
            </div>}
          </div>

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
            <p className="pg-privacy-note">נשתמש בפרטים כדי לחזור אליכם לגבי ההצטרפות. דיוורים יישלחו רק אם תסמנו את התיבה השנייה.</p>
            {/* Two boxes, worded exactly as nadlanistim_consent_texts() records them: privacy is required, newsletters are a free choice. */}
            <label className="v6-contact__consent" htmlFor="f-consent">
              <input id="f-consent" name="consent" value="1" type="checkbox" required />
              <span>מוסכמת עלי <a href="/privacy" target="_blank" rel="noopener">מדיניות הפרטיות</a> של האתר.</span>
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
        </div>
      </section>
      </main>

      <SiteFooter />
    </div>
  );
}
