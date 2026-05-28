"use client";

import { useEffect, useState } from "react";
import "./v5.css";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type MemberCategory = { count: string; title: string; desc: string; avatars: number[] };
type WhyReason = { num: string; title: string; desc: string };
type Story = { tag: string; quote: string; name: string; role: string; avatar: number };
type Reco = { img: string; name: string; role: string; duration: string };
type Project = { img: string; tag: string; title: string; desc: string; period: string; partners: string };
type EventItem = { day: string; month: string; tag: string; accent?: boolean; title: string; desc: string; place: string; time: string };
type ArticleItem = { cat: string; title: string; author: string; time: string };

const NAV_LINKS: [string, string][] = [
  ["#about", "הקהילה"],
  ["#members", "חברי הקהילה"],
  ["#stories", "סיפורי הצלחה"],
  ["#events", "אירועים"],
  ["#articles", "תוכן מקצועי"],
  ["#contact", "צרו קשר"],
];

const MARQUEE = ["יזמים", "משקיעים", "שמאים", "עורכי דין", "קבלנים", "מתווכים", "אדריכלים", "חברות מימון", "פרופטק", "שיווק נדל״ן"];

const STATS = [
  { count: 3400, label: "חברי קהילה פעילים", suffix: "+", width: "96%" },
  { count: 120, label: "אירועים מקצועיים בשנה", suffix: "", width: "78%" },
  { count: 640, label: "שיתופי פעולה שנוצרו", suffix: "+", width: "62%" },
  { count: 280, label: "פרויקטים שנוצרו דרך הקהילה", suffix: "+", width: "46%" },
];

const ABOUT_BULLETS: [string, string][] = [
  ["01", "חיבורים ישירים בין אנשי מקצוע"],
  ["02", "אירועי נטוורקינג פרימיום"],
  ["03", "למידה ושיתוף ידע ברמה הגבוהה בענף"],
  ["04", "הזדמנויות עסקיות שמתחילות בקהילה"],
];

const MEMBERS: MemberCategory[] = [
  { count: "412", title: "יזמים", desc: "יזמי נדל״ן פרטיים ויזמים בחברות, מקבוצות רכישה ועד מגדלים.", avatars: [12, 22, 33] },
  { count: "386", title: "משקיעים", desc: "משקיעים פרטיים, משפחתיים ומוסדיים — בארץ ובחו״ל.", avatars: [15, 44, 55] },
  { count: "118", title: "שמאי מקרקעין", desc: "שמאים מובילים בענף, שמלווים עסקאות, פרויקטים ובדיקות נאותות.", avatars: [8, 18, 28] },
  { count: "294", title: "עורכי דין", desc: "משרדי עו״ד בנדל״ן, ליווי עסקאות, התחדשות עירונית ומיסוי.", avatars: [5, 25, 45] },
  { count: "208", title: "קבלנים ומבצעים", desc: "חברות ביצוע, קבלני שלד וגמר, ספקי תשתיות ושירותי בנייה.", avatars: [14, 34, 54] },
  { count: "521", title: "מתווכים", desc: "סוכנויות תיווך ומתווכים פרטיים — מסחרי, מגורים, יוקרה.", avatars: [20, 40, 60] },
  { count: "142", title: "אדריכלים ומתכננים", desc: "משרדי תכנון ובינוי ערים, אדריכלי פנים ועיצוב מבנים.", avatars: [2, 32, 52] },
  { count: "94", title: "חברות מימון", desc: "בנקאים, יועצי משכנתאות, קרנות חוב והון פרטי.", avatars: [17, 37, 57] },
  { count: "76", title: "פרופטק", desc: "סטארטאפים וחברות טכנולוגיה שמשנות את ענף הנדל״ן.", avatars: [11, 31, 51] },
  { count: "163", title: "שיווק ופרסום נדל״ן", desc: "אנשי שיווק, מיתוג, דיגיטל ופרסום מהמובילים בענף.", avatars: [9, 29, 49] },
];

const WHY: WhyReason[] = [
  { num: "01", title: "גישה לאנשים הנכונים", desc: "היכרות ישירה עם הדמויות שמזיזות את ענף הנדל״ן הישראלי." },
  { num: "02", title: "נטוורקינג איכותי", desc: "מפגשים אינטימיים, פאנלים סגורים וטבלאות עגולות." },
  { num: "03", title: "שיתופי פעולה", desc: "שותפויות עסקיות שמתחילות מהיכרות אישית בקהילה." },
  { num: "04", title: "חשיפה להזדמנויות", desc: "פרויקטים ועסקאות שלא יוצאות החוצה — קודם בקהילה." },
  { num: "05", title: "למידה מקצועית", desc: "הרצאות, מאסטרקלאסים ושיחות עומק עם המומחים בענף." },
  { num: "06", title: "אירועים וכנסים", desc: "למעלה מ‑120 אירועים בשנה — מקטנים ועד הכנס השנתי." },
  { num: "07", title: "קהילה פעילה", desc: "קבוצות, פורומים ושיחות יומיות סביב הנושאים החמים." },
  { num: "08", title: "היכרויות עסקיות", desc: "מקרים אמיתיים של שותפים שמצאו זה את זה דרכנו." },
];

const STORIES: Story[] = [
  { tag: "שותפות עסקית", quote: "״מצאתי שותף לקרקע בקיסריה דרך קבוצת הוואטסאפ. סגרנו עסקה תוך שבועיים.״", name: "נועה ברגר", role: "יזמית, ברגר השקעות", avatar: 47 },
  { tag: "לקוחות חדשים", quote: "״כעורך דין, הקהילה הפכה למקור הלקוחות הראשי שלי. שירות שמומלץ הוא הכי איכותי.״", name: "עו״ד דניאל כהן", role: "משרד כהן ושות׳", avatar: 33 },
  { tag: "שיתוף פעולה", quote: "״באחת מהארוחות החודשיות פגשנו את אדריכל הפרויקט הבא שלנו. כימיה ב‑10 דקות.״", name: "רן מימון", role: "מנכ״ל, מימון בנייה", avatar: 53 },
];

const RECOS: Reco[] = [
  { img: "1573496359142-b8d87734a5a2", name: "אלון שמיר", role: "סמנכ״ל פיתוח עסקי, שיכון ובינוי", duration: "02:14" },
  { img: "1580489944761-15a19d654956", name: "ד״ר ענת רוזנברג", role: "שמאית מקרקעין, רוזנברג שמאות", duration: "01:47" },
  { img: "1507003211169-0a1dd7228f2d", name: "יואב פרידמן", role: "מנכ״ל, פרידמן השקעות נדל״ן", duration: "03:02" },
];

const FEATURED_DETAILS: [string, string][] = [
  ["מיקום", "אקספו תל אביב, ביתן 1"],
  ["שעות", "09:00 — 21:00"],
  ["פאנלים", "14 מסלולים מקבילים"],
  ["משתתפים", "+1,400"],
];

const SPONSORS_MAIN = ["שיכון ובינוי", "אזורים", "דוניץ", "אאורה", "צ׳ריטון", "אפריקה ישראל"];
const SPONSORS_EVENT = ["בנק לאומי", "דלויט", "EY", "KPMG", "PWC", "גורניצקי", "הרצוג פוקס", "גושן ארנון"];

const PROJECTS: Project[] = [
  { img: "1545324418-cc1a3fa10c00", tag: "התחדשות עירונית", title: "פינוי‑בינוי, גבעת שמואל", desc: "שיתוף פעולה בין 3 יזמים שנפגשו בקהילה. 240 יחידות.", period: "2024 — היום", partners: "3 שותפים" },
  { img: "1486406146926-c627a92ad1ab", tag: "קרקע יזמית", title: "מתחם מסחרי, ראש העין", desc: "קבוצת השקעה של 14 חברי קהילה. הון של 28M ש״ח.", period: "2023", partners: "14 שותפים" },
  { img: "1448630360428-65456885c650", tag: "מגדל יוקרה", title: "מגדל הברזל, רמת גן", desc: "שותפות יזמית בין שני חברים. 32 קומות, מסחר ומגורים.", period: "2022 — 2025", partners: "2 שותפים" },
  { img: "1582407947304-fd86f028f716", tag: "מימון", title: "קרן חוב נדל״ן", desc: "קרן שהוקמה על ידי 4 חברי קהילה. 120M ש״ח גיוס ראשון.", period: "2024", partners: "4 שותפים" },
];

const SECONDARY_ARTICLES: ArticleItem[] = [
  { cat: "רגולציה", title: "חוק התחדשות עירונית 2026 — מה צריך לדעת", author: "עו״ד דניאל כהן", time: "9 דק׳" },
  { cat: "פרופטק", title: "5 פלטפורמות שמשנות את עולם המכרזים", author: "שירה אלוני", time: "6 דק׳" },
  { cat: "מימון", title: "קרנות חוב נדל״ן — איך לבחור נכון", author: "רן מימון", time: "11 דק׳" },
];

const EVENTS: EventItem[] = [
  { day: "28", month: "מאי", tag: "ארוחת ערב סגורה", title: "שולחן עגול — יזמי התחדשות עירונית", desc: "20 יזמים. שולחן אחד. נושאים חמים בתעשייה. רק לחברי קהילה.", place: "מסעדת מסה, תל אביב", time: "20:00" },
  { day: "04", month: "יוני", tag: "מאסטרקלאס", title: "קרנות חוב פרטיות — A to Z", desc: "שלוש שעות עומק עם מנהלי שלוש הקרנות המובילות בארץ.", place: "WeWork גינדי, ת״א", time: "09:30" },
  { day: "14", month: "יוני", tag: "הכנס השנתי", accent: true, title: "כנס הנדלניסטים 2026", desc: "היום הגדול של הקהילה. 42 מרצים. 14 פאנלים. +1,400 משתתפים.", place: "אקספו תל אביב", time: "09:00 — 21:00" },
  { day: "02", month: "יולי", tag: "סיור מקצועי", title: "סיור בפרויקטים החדשים בתל אביב", desc: "סיור מודרך עם היזמים — ארבעה מגדלים בלב העיר.", place: "נקודת מפגש — שרונה", time: "16:00" },
];

const ROLE_OPTIONS = ["יזם / יזמית", "משקיע / משקיעה", "שמאי מקרקעין", "עו״ד", "קבלן", "מתווך / מתווכת", "אדריכל / אדריכלית", "חברת מימון", "פרופטק", "שיווק נדל״ן", "אחר"];

const FOOTER_COLS: { h: string; links: [string, string][] }[] = [
  { h: "קהילה", links: [["#about", "אודות"], ["#members", "חברי הקהילה"], ["#stories", "סיפורי הצלחה"]] },
  { h: "אירועים", links: [["#events", "קרובים"], ["#featured", "הכנס השנתי"], ["#", "ארכיון אירועים"]] },
  { h: "תוכן", links: [["#articles", "כתבות"], ["#", "ניוזלטר"], ["#", "פודקאסט"]] },
  { h: "צרו קשר", links: [["#contact", "הצטרפות"], ["mailto:hello@nadlanistim.co.il", "אימייל"], ["#", "וואטסאפ"]] },
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
    const els = document.querySelectorAll<HTMLElement>(".v5-root [data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useStatCounters() {
  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>(".v5-root [data-count]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const target = parseInt(el.dataset.count || "0", 10);
          const suffix = el.dataset.suffix || "";
          const duration = 1800;
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

export default function HomePageV5() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const scrolled = useScrolled();
  useRevealOnScroll();
  useStatCounters();

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
    <div className="v5-root">
      <div className="v5-ambient" aria-hidden>
        <div className="v5-ambient__orb v5-ambient__orb--1" />
        <div className="v5-ambient__orb v5-ambient__orb--2" />
        <div className="v5-ambient__orb v5-ambient__orb--3" />
        <div className="v5-ambient__grain" />
      </div>

      {/* Nav */}
      <header className={`v5-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="v5-nav__inner v5-glass">
          <button className="v5-nav__menu" aria-label="פתח תפריט" onClick={() => setDrawerOpen(true)}>
            <span /><span /><span />
          </button>
          <a href="#top" className="v5-nav__logo" aria-label="הנדלניסטים — דף הבית">
            <img src="/v5-assets/logo.png" alt="הנדלניסטים" />
          </a>
          <nav className="v5-nav__links" aria-label="ניווט ראשי">
            {NAV_LINKS.map(([href, label]) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </nav>
          <a href="#contact" className="v5-btn v5-btn--primary v5-nav__cta">
            <span className="v5-nav__cta-long">הצטרפו לקהילה</span>
            <span className="v5-nav__cta-short">הצטרפו</span>
            <ArrowIcon />
          </a>
        </div>
      </header>

      {/* Drawer (mobile) */}
      <div className={`v5-drawer${drawerOpen ? " is-open" : ""}`} aria-hidden={!drawerOpen}>
        <div className="v5-drawer__veil" onClick={closeDrawer} />
        <div className="v5-drawer__panel">
          <button className="v5-drawer__close" aria-label="סגור" onClick={closeDrawer}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
            </svg>
          </button>
          {NAV_LINKS.map(([href, label]) => (
            <a key={href} href={href} className="v5-drawer__link" onClick={closeDrawer}>{label}</a>
          ))}
          <a href="#contact" className="v5-btn v5-btn--primary v5-btn--lg v5-btn--block v5-drawer__cta" onClick={closeDrawer}>
            <span>הצטרפו לקהילה</span>
            <ArrowIcon />
          </a>
        </div>
      </div>

      {/* Hero */}
      <section className="v5-hero" id="top">
        <div className="v5-hero__media">
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=2400&q=80"
            alt=""
          />
        </div>
        <div className="v5-container v5-hero__content">
          <div className="v5-hero__eyebrow v5-glass" data-reveal>
            <span className="v5-dot" />
            <span>קהילה פעילה · 2017 — היום</span>
          </div>
          <h1 className="v5-hero__title" data-reveal>
            <span className="v5-line"><span>הקהילה</span></span>
            <span className="v5-line"><span>שמחברת את עולם</span></span>
            <span className="v5-line"><span><em>הנדל״ן בישראל</em></span></span>
          </h1>
          <p className="v5-hero__sub" data-reveal>
            מקום אחד ליזמים, משקיעים, שמאים, עו״ד, קבלנים, מתווכים, אדריכלים<br />
            ובעלי מקצוע — ליצור קשרים, ללמוד, להתפתח ולייצר הזדמנויות אמיתיות.
          </p>
          <div className="v5-hero__cta" data-reveal>
            <a href="#contact" className="v5-btn v5-btn--primary v5-btn--lg">
              <span>הצטרפו לקהילה</span>
              <ArrowIcon />
            </a>
            <a href="#events" className="v5-btn v5-btn--ghost v5-btn--lg">
              <span>האירועים הקרובים</span>
            </a>
          </div>
          <div className="v5-hero__bottom">
            <div className="v5-hero__scroll">
              <span>גלילה</span>
              <span className="v5-hero__scroll-line" />
            </div>
            <div className="v5-hero__caption">
              <span className="v5-hero__caption-num">01 / 13</span>
              <span>כנס הנדלניסטים השנתי · תל אביב</span>
            </div>
          </div>
        </div>

        <div className="v5-container">
          <div className="v5-marquee v5-glass" aria-hidden>
            <div className="v5-marquee__track">
              {[...MARQUEE, ...MARQUEE].map((term, i) => (
                <span key={i} className="v5-mq-item">
                  <span>{term}</span>
                  <span className="v5-diamond">◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="v5-section">
        <div className="v5-container">
          <header className="v5-section-head" data-reveal>
            <span className="v5-eyebrow"><span className="v5-dot" />הקהילה במספרים</span>
            <h2>קהילה גדולה. <em>השפעה אמיתית.</em></h2>
          </header>
          <div className="v5-stats__grid">
            {STATS.map((s) => (
              <div key={s.label} className="v5-stat v5-glass" data-reveal>
                <div className="v5-stat__num" data-count={s.count} data-suffix={s.suffix}>0{s.suffix}</div>
                <div className="v5-stat__label">{s.label}</div>
                <div className="v5-stat__bar">
                  <span style={{ ["--w" as never]: s.width } as React.CSSProperties} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="v5-section" id="about">
        <div className="v5-container">
          <div className="v5-about__grid">
            <div className="v5-about__text">
              <span className="v5-eyebrow" data-reveal><span className="v5-dot" />מי אנחנו</span>
              <h2 data-reveal>
                לא פיד.<br />
                לא פורטל.<br />
                <em>קהילה.</em>
              </h2>
              <p data-reveal>
                הנדלניסטים היא קהילה מקצועית של מעל 3,400 אנשי נדל״ן בישראל —
                אנשים שמייצרים יחד עסקאות, פרויקטים, ידע והזדמנויות.
              </p>
              <p data-reveal>
                אנחנו לא עוד מקום לקרוא בו תוכן. אנחנו המקום שבו אנשי הנדל״ן
                הכי טובים בישראל נפגשים, מכירים, ועושים עסקים.
              </p>
              <ul className="v5-about__list" data-reveal>
                {ABOUT_BULLETS.map(([n, text]) => (
                  <li key={n}><span>{n}</span>{text}</li>
                ))}
              </ul>
            </div>
            <div className="v5-about__media" data-reveal>
              <figure className="v5-about__img v5-about__img--lg">
                <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80" alt="" />
              </figure>
              <figure className="v5-about__img v5-about__img--sm">
                <img src="https://images.unsplash.com/photo-1559223607-a43c990c692c?w=900&q=80" alt="" />
              </figure>
              <div className="v5-about__badge v5-glass">
                <div className="v5-about__badge-num">7</div>
                <div className="v5-about__badge-text">שנים<br />של קהילה</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Members */}
      <section className="v5-section" id="members">
        <div className="v5-container">
          <header className="v5-section-head" data-reveal>
            <span className="v5-eyebrow"><span className="v5-dot" />חברי הקהילה</span>
            <h2>הערך הוא <em>האנשים</em>.</h2>
            <p className="v5-section-head__sub">עשרה עולמות מקצועיים. אלפי אנשי מקצוע. גג אחד.</p>
          </header>
          <div className="v5-members__grid">
            {MEMBERS.map((m) => (
              <article key={m.title} className="v5-member v5-glass" data-reveal>
                <div className="v5-member__count">{m.count}</div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
                <div className="v5-member__avatars" aria-hidden>
                  {m.avatars.map((a) => (
                    <span key={a} style={{ backgroundImage: `url(https://i.pravatar.cc/80?img=${a})` }} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="v5-section">
        <div className="v5-container">
          <header className="v5-section-head v5-section-head--center" data-reveal>
            <span className="v5-eyebrow"><span className="v5-dot" />למה להצטרף</span>
            <h2>שמונה סיבות.<br /><em>אחת מספיקה.</em></h2>
          </header>
          <div className="v5-why__grid">
            {WHY.map((w) => (
              <article key={w.num} className="v5-why__card v5-glass" data-reveal>
                <div className="v5-why__num">{w.num}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="v5-section" id="stories">
        <div className="v5-container">
          <header className="v5-section-head" data-reveal>
            <span className="v5-eyebrow"><span className="v5-dot" />סיפורי הצלחה</span>
            <h2>חיבורים שהפכו <em>לעסקאות.</em></h2>
            <p className="v5-section-head__sub">לא טקסט שיווקי. סיפורים אמיתיים של אנשים אמיתיים בקהילה.</p>
          </header>
          <div className="v5-stories__grid">
            <article className="v5-story v5-story--lg v5-glass" data-reveal>
              <figure className="v5-story__img">
                <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&q=80" alt="" />
              </figure>
              <div className="v5-story__body">
                <blockquote>״הכרתי את השותף שלי לפרויקט של 40 יחידות דיור בערב סוף שנה של הנדלניסטים. שש שעות של שיחות הפכו לשותפות של שלוש שנים.״</blockquote>
                <div className="v5-story__by">
                  <div className="v5-story__avatar" style={{ backgroundImage: "url(https://i.pravatar.cc/120?img=68)" }} />
                  <div>
                    <div className="v5-story__name">איתי לבנון</div>
                    <div className="v5-story__role">יזם, לבנון נדל״ן</div>
                  </div>
                </div>
              </div>
            </article>
            {STORIES.map((s) => (
              <article key={s.name} className="v5-story v5-glass" data-reveal>
                <span className="v5-story__tag">{s.tag}</span>
                <blockquote>{s.quote}</blockquote>
                <div className="v5-story__by">
                  <div className="v5-story__avatar" style={{ backgroundImage: `url(https://i.pravatar.cc/120?img=${s.avatar})` }} />
                  <div>
                    <div className="v5-story__name">{s.name}</div>
                    <div className="v5-story__role">{s.role}</div>
                  </div>
                </div>
              </article>
            ))}
            <article className="v5-story v5-story--lg v5-story--accent v5-glass" data-reveal>
              <figure className="v5-story__img">
                <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&q=80" alt="" />
              </figure>
              <div className="v5-story__body">
                <blockquote>״הצטרפנו לקהילה כסטארטאפ קטן. שנתיים אחרי, חצי מבסיס הלקוחות שלנו הם חברים בקהילה. זה לא מקרה.״</blockquote>
                <div className="v5-story__by">
                  <div className="v5-story__avatar" style={{ backgroundImage: "url(https://i.pravatar.cc/120?img=24)" }} />
                  <div>
                    <div className="v5-story__name">שירה אלוני</div>
                    <div className="v5-story__role">מייסדת, PropAI</div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="v5-section">
        <div className="v5-container">
          <header className="v5-section-head v5-section-head--center" data-reveal>
            <span className="v5-eyebrow"><span className="v5-dot" />המלצות מקצועיות</span>
            <h2>מה אומרים <em>עלינו.</em></h2>
          </header>
          <div className="v5-recos__grid">
            {RECOS.map((r) => (
              <article key={r.name} className="v5-reco" data-reveal>
                <div className="v5-reco__video v5-glass">
                  <img src={`https://images.unsplash.com/photo-${r.img}?w=900&q=80`} alt="" />
                  <button className="v5-reco__play" aria-label="נגן וידאו">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </button>
                  <div className="v5-reco__duration">{r.duration}</div>
                </div>
                <div className="v5-reco__meta">
                  <div className="v5-reco__name">{r.name}</div>
                  <div className="v5-reco__role">{r.role}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Featured event */}
      <section className="v5-featured" id="featured">
        <div className="v5-featured__bg">
          <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=2400&q=80" alt="" />
        </div>
        <div className="v5-container v5-featured__grid">
          <div className="v5-featured__text">
            <span className="v5-eyebrow" data-reveal><span className="v5-dot" />האירוע המרכזי</span>
            <div className="v5-featured__date" data-reveal>
              <div><span>14</span>יוני</div>
              <div className="v5-featured__date-sep" />
              <div><span>2026</span>תל אביב</div>
            </div>
            <h2 className="v5-featured__title" data-reveal>
              כנס הנדלניסטים<br /><em>השנתי 2026</em>
            </h2>
            <p className="v5-featured__desc" data-reveal>
              12 שעות של פאנלים, מאסטרקלאסים ונטוורקינג בלב תל אביב.
              עם הדמויות המובילות בענף — יזמים, משקיעים, רגולטורים ומקבלי החלטות.
            </p>
            <div className="v5-featured__speakers" data-reveal>
              <div className="v5-featured__speakers-imgs">
                {[12, 22, 32, 42, 52].map((n) => (
                  <span key={n} style={{ backgroundImage: `url(https://i.pravatar.cc/120?img=${n})` }} />
                ))}
              </div>
              <div className="v5-featured__speakers-text">
                <strong>+42 מרצים</strong><br />מהמובילים בענף הנדל״ן הישראלי
              </div>
            </div>
            <div className="v5-featured__cta" data-reveal>
              <a href="#" className="v5-btn v5-btn--primary v5-btn--lg">
                <span>הירשמו לכנס</span>
                <ArrowIcon />
              </a>
              <a href="#" className="v5-btn v5-btn--ghost v5-btn--lg">תוכנית הכנס</a>
            </div>
          </div>
          <aside className="v5-featured__card v5-glass" data-reveal>
            <div className="v5-featured__card-img">
              <img src="https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=900&q=80" alt="" />
            </div>
            <div className="v5-featured__card-body">
              {FEATURED_DETAILS.map(([k, v]) => (
                <div key={k} className="v5-featured__card-row">
                  <span>{k}</span><strong>{v}</strong>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Sponsors */}
      <section className="v5-section">
        <div className="v5-container">
          <header className="v5-section-head v5-section-head--center" data-reveal>
            <span className="v5-eyebrow"><span className="v5-dot" />שותפים</span>
            <h2>עומדים <em>איתנו.</em></h2>
          </header>
          <div className="v5-sponsors__group" data-reveal>
            <h4 className="v5-sponsors__title">שותפים קבועים</h4>
            <div className="v5-sponsors__logos">
              {SPONSORS_MAIN.map((n) => (
                <div key={n} className="v5-sponsors__logo">{n}</div>
              ))}
            </div>
          </div>
          <div className="v5-sponsors__group" data-reveal>
            <h4 className="v5-sponsors__title">נותני חסות לאירועים</h4>
            <div className="v5-sponsors__logos v5-sponsors__logos--sm">
              {SPONSORS_EVENT.map((n) => (
                <div key={n} className="v5-sponsors__logo">{n}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="v5-section">
        <div className="v5-container">
          <header className="v5-section-head" data-reveal>
            <span className="v5-eyebrow"><span className="v5-dot" />פרויקטים ושיתופי פעולה</span>
            <h2>דברים <em>שקרו כאן.</em></h2>
            <p className="v5-section-head__sub">פרויקטים, עסקאות ושיתופי פעולה שנולדו בתוך הקהילה.</p>
          </header>
          <div className="v5-projects__grid">
            {PROJECTS.map((p) => (
              <article key={p.title} className="v5-project" data-reveal>
                <figure className="v5-project__img v5-glass">
                  <img src={`https://images.unsplash.com/photo-${p.img}?w=900&q=80`} alt="" />
                  <div className="v5-project__tag">{p.tag}</div>
                </figure>
                <div className="v5-project__body">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <div className="v5-project__meta">
                    <span>{p.period}</span><span>·</span><span>{p.partners}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="v5-section" id="articles">
        <div className="v5-container">
          <header className="v5-section-head v5-section-head--row" data-reveal>
            <div>
              <span className="v5-eyebrow"><span className="v5-dot" />תוכן מקצועי</span>
              <h2>קריאה <em>איכותית.</em></h2>
            </div>
            <a href="#" className="v5-link-arrow">
              <span>כל הכתבות</span>
              <ArrowIcon />
            </a>
          </header>
          <div className="v5-articles__grid">
            <article className="v5-article v5-article--feature v5-glass" data-reveal>
              <figure className="v5-article__img">
                <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80" alt="" />
              </figure>
              <div className="v5-article__body">
                <div className="v5-article__cat">ניתוח שוק</div>
                <h3>איפה נסגרות עכשיו עסקאות הקרקע הכי טובות?</h3>
                <p>מיפוי של 18 חודשים אחרונים בשוק הקרקעות הפרטי — והאזורים שמתחתם הפעילות שקטה אבל הרווחיות גבוהה.</p>
                <div className="v5-article__meta">
                  <span>אלון שמיר</span><span>·</span><span>14 דק׳ קריאה</span><span>·</span><span>מאי 2026</span>
                </div>
              </div>
            </article>
            {SECONDARY_ARTICLES.map((a) => (
              <article key={a.title} className="v5-article v5-glass" data-reveal>
                <div className="v5-article__cat">{a.cat}</div>
                <h3>{a.title}</h3>
                <div className="v5-article__meta">
                  <span>{a.author}</span><span>·</span><span>{a.time}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="v5-section" id="events">
        <div className="v5-container">
          <header className="v5-section-head v5-section-head--row" data-reveal>
            <div>
              <span className="v5-eyebrow"><span className="v5-dot" />אירועים קרובים</span>
              <h2>הקלנדר <em>שלכם.</em></h2>
            </div>
            <a href="#" className="v5-link-arrow">
              <span>לכל האירועים</span>
              <ArrowIcon />
            </a>
          </header>
          <div className="v5-events__list">
            {EVENTS.map((e) => (
              <article key={e.title} className="v5-event v5-glass" data-reveal>
                <div className="v5-event__date">
                  <span className="v5-event__day">{e.day}</span>
                  <span className="v5-event__month">{e.month}</span>
                </div>
                <div className="v5-event__body">
                  <span className={`v5-event__tag${e.accent ? " v5-event__tag--accent" : ""}`}>{e.tag}</span>
                  <h3>{e.title}</h3>
                  <p>{e.desc}</p>
                  <div className="v5-event__meta">
                    <span>{e.place}</span><span>·</span><span>{e.time}</span>
                  </div>
                </div>
                <a href="#" className="v5-event__cta">
                  <span>הירשמו</span>
                  <ArrowIcon />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="v5-section v5-contact" id="contact">
        <div className="v5-contact__glow" aria-hidden />
        <div className="v5-container v5-contact__grid">
          <div className="v5-contact__text">
            <span className="v5-eyebrow" data-reveal><span className="v5-dot" />הצטרפו אלינו</span>
            <h2 data-reveal>
              בואו להיות חלק<br />
              <em>מהקהילה שמזיזה</em><br />
              את ענף הנדל״ן.
            </h2>
            <p data-reveal>
              השאירו פרטים ואנחנו נחזור אליכם תוך 24 שעות עם פרטים על
              תהליך ההצטרפות, החברות והאירועים הקרובים.
            </p>
            <div className="v5-contact__channels" data-reveal>
              <a href="#" className="v5-contact__channel v5-glass">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2.6-1.3a.8.8 0 0 0-.9.1l-1.2 1.2c-1.9-.9-3.4-2.4-4.3-4.3l1.2-1.2a.8.8 0 0 0 .1-.9L8.5 5.4a.8.8 0 0 0-.9-.4l-2.3.6a.8.8 0 0 0-.6.8c0 5.9 4.8 10.7 10.7 10.7a.8.8 0 0 0 .8-.6l.6-2.3a.8.8 0 0 0-.4-.9z" /></svg>
                <span>וואטסאפ</span>
              </a>
              <a href="#" className="v5-contact__channel v5-glass">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.3 18H5.7V9.7h2.6V18zM7 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18 18h-2.6v-4.3c0-1 0-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.2V18H9.8V9.7h2.5v1.1h0c.4-.7 1.2-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1V18z" /></svg>
                <span>לינקדאין</span>
              </a>
              <a href="mailto:hello@nadlanistim.co.il" className="v5-contact__channel v5-glass">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
                <span>אימייל</span>
              </a>
            </div>
          </div>

          <form
            className={`v5-contact__form v5-glass${sent ? " sent" : ""}`}
            data-reveal
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <h3>הרשמה לקהילה</h3>
            <div className="v5-field">
              <label htmlFor="f-name">שם מלא</label>
              <input id="f-name" type="text" required placeholder="ישראלה ישראלי" />
            </div>
            <div className="v5-field-row">
              <div className="v5-field">
                <label htmlFor="f-phone">טלפון</label>
                <input id="f-phone" type="tel" required placeholder="050-0000000" />
              </div>
              <div className="v5-field">
                <label htmlFor="f-email">אימייל</label>
                <input id="f-email" type="email" required placeholder="you@company.com" />
              </div>
            </div>
            <div className="v5-field">
              <label htmlFor="f-role">תחום עיסוק</label>
              <select id="f-role" required defaultValue="">
                <option value="">בחרו תחום…</option>
                {ROLE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <button type="submit" className="v5-btn v5-btn--primary v5-btn--block v5-btn--lg">
              <span>שליחת בקשה</span>
              <ArrowIcon />
            </button>
            <p className="v5-contact__fine">בלחיצה על שליחה את/ה מאשר/ת קבלת תקשורת מהקהילה.</p>
            <div className="v5-contact__sent-msg">
              <strong>הבקשה נשלחה. ✓</strong>
              <span>נחזור אליך תוך 24 שעות.</span>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="v5-footer">
        <div className="v5-container">
          <div className="v5-footer__top">
            <div className="v5-footer__brand">
              <div className="v5-footer__logo">
                <img src="/v5-assets/logo.png" alt="הנדלניסטים" />
              </div>
              <p>הקהילה המקצועית של ענף הנדל״ן בישראל.<br />קשרים. אירועים. הזדמנויות.</p>
            </div>
            <div className="v5-footer__cols">
              {FOOTER_COLS.map((c) => (
                <div key={c.h}>
                  <h5>{c.h}</h5>
                  {c.links.map(([href, label]) => (
                    <a key={label} href={href}>{label}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="v5-footer__bottom">
            <span>© 2026 הנדלניסטים. כל הזכויות שמורות.</span>
            <span className="v5-footer__legal">
              <a href="#">תנאי שימוש</a>
              <a href="#">פרטיות</a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
