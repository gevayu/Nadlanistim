"use client";

import { Fragment, useEffect, useRef, useState } from "react";
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

type MemberCategory = { count: string; title: string; desc: string; avatars: number[] };
type JobOffer = { tag: string; title: string; company: string; location: string; desc: string; img: string };
type Project = { img: string; tag: string; title: string; desc: string; period: string; partners: string };
type EventItem = { day: string; month: string; tag: string; accent?: boolean; title: string; desc: string; place: string; time: string };
type ArticleItem = { cat: string; title: string; desc: string; author: string; time: string };

const NAV_LINKS: [string, string][] = [
  ["#about", "מי אנחנו?"],
  ["#stories", "קריירה"],
  ["#podcast", "פודקאסט"],
  ["#dealroom", "חדר העסקאות"],
  ["#events", "אירועים"],
  ["#articles", "תוכן מקצועי"],
  ["#contact", "צרו קשר"],
];

const MARQUEE = ["יזמים", "משקיעים", "שמאים", "עורכי דין", "קבלנים", "אדריכלים", "חברות מימון", "פרופטק", "שיווק נדל״ן"];

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
  { count: "142", title: "אדריכלים ומתכננים", desc: "משרדי תכנון ובינוי ערים, אדריכלי פנים ועיצוב מבנים.", avatars: [2, 32, 52] },
  { count: "94", title: "חברות מימון", desc: "בנקאים, יועצי משכנתאות, קרנות חוב והון פרטי.", avatars: [17, 37, 57] },
  { count: "76", title: "פרופטק", desc: "סטארטאפים וחברות טכנולוגיה שמשנות את ענף הנדל״ן.", avatars: [11, 31, 51] },
  { count: "163", title: "שיווק ופרסום נדל״ן", desc: "אנשי שיווק, מיתוג, דיגיטל ופרסום מהמובילים בענף.", avatars: [9, 29, 49] },
];

type Nadlanist = { img: string; quote: string; name: string; role: string };

const NADLANISTIM: Nadlanist[] = [
  { img: "1560250097-0b93528c311a", name: "איתי לבנון", role: "יזם, לבנון נדל״ן", quote: "״הכרתי את השותף שלי לפרויקט של 40 יחידות דיור בערב סוף שנה של הנדלניסטים. שש שעות של שיחות הפכו לשותפות של שלוש שנים.״" },
  { img: "1573496359142-b8d87734a5a2", name: "אלון שמיר", role: "סמנכ״ל פיתוח עסקי, שיכון ובינוי", quote: "״הקהילה היא המקום הראשון שאני בודק כשמחפשים שותף לעסקה. שלוש מהעסקאות הגדולות שלי התחילו בשיחת מסדרון בכנס.״" },
  { img: "1580489944761-15a19d654956", name: "ד״ר ענת רוזנברג", role: "שמאית מקרקעין, רוזנברג שמאות", quote: "״בתור שמאית, הנטוורקינג כאן שינה לי את העסק. אני מלווה היום פרויקטים שלא הייתי מגיעה אליהם בלי הקהילה.״" },
  { img: "1507003211169-0a1dd7228f2d", name: "יואב פרידמן", role: "מנכ״ל, פרידמן השקעות נדל״ן", quote: "״גייסנו 120 מיליון ש״ח לקרן הראשונה שלנו כמעט כולם מתוך הקהילה. אנשים שסומכים עליך כי הם מכירים אותך באמת.״" },
];

const JOB_OFFERS: JobOffer[] = [
  { tag: "קריירה · משרת ניהול", title: "סמנכ״ל/ית פיתוח עסקי", company: "קרן השקעות נדל״ן", location: "תל אביב", desc: "הזדמנות נדירה להשתלב בהנהלת קרן השקעות נדל״ן בצמיחה — איתור, ייזום וניהול עסקאות קרקע ברחבי הארץ.", img: "1556157382-97eda2d62296" },
  { tag: "קריירה · שמאות", title: "שמאי/ת מקרקעין בכיר/ה", company: "פירמת שמאות מובילה", location: "רמת גן", desc: "פירמת שמאות גדולה מגייסת שמאי/ת מקרקעין לליווי פיננסי של פרויקטים ועריכת דוחות אפס לגופים מוסדיים.", img: "1551836022-d5d88e9218df" },
  { tag: "קריירה · ניהול פרויקטים", title: "מנהל/ת פרויקטים בנדל״ן", company: "חברה יזמית מובילה", location: "אזור המרכז", desc: "לחברה יזמית מובילה באזור המרכז דרוש/ה מנהל/ת פרויקטים להובלת מיזמי פינוי בינוי ותמ״א 38 מקצה לקצה.", img: "1521119989659-a83eee488004" },
  { tag: "קריירה · שיווק ומכירות", title: "מנהל/ת שיווק ומכירות", company: "חברת שיווק נדל״ן מובילה", location: "הרצליה פיתוח", desc: "חברת שיווק נדל״ן מובילה מגייסת מנהל/ת שיווק ומכירות להובלת קמפיינים ומכירת פרויקטי יוקרה.", img: "1507003211169-0a1dd7228f2d" },
];

const COMMUNITIES = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  logo: "/community-badge.png",
  label: "תת קהילה",
}));

const FEATURED_DETAILS: [string, string][] = [
  ["מיקום", "אקספו תל אביב, ביתן 1"],
  ["שעות", "09:00 — 21:00"],
  ["פאנלים", "3 מסלולים מקבילים"],
  ["משתתפים", "800"],
];

type Sponsor = { name: string; logo?: string };
const SPONSORS_MAIN: Sponsor[] = [
  { name: "שיכון ובינוי", logo: "/v6-assets/sponsors/shikun.webp" },
  { name: "אזורים", logo: "/v6-assets/sponsors/azorim.png" },
  { name: "דוניץ", logo: "/v6-assets/sponsors/donitz.png" },
  { name: "אאורה", logo: "/v6-assets/sponsors/aura.png" },
  { name: "צ׳ריטון" },
  { name: "אפריקה ישראל", logo: "/v6-assets/sponsors/africa.svg" },
];
const SPONSORS_EVENT: Sponsor[] = [
  { name: "בנק לאומי", logo: "/v6-assets/sponsors/leumi.png" },
  { name: "דלויט", logo: "/v6-assets/sponsors/deloitte.svg" },
  { name: "EY", logo: "/v6-assets/sponsors/ey.svg" },
  { name: "KPMG", logo: "/v6-assets/sponsors/kpmg.svg" },
  { name: "PWC", logo: "/v6-assets/sponsors/pwc.svg" },
  { name: "גורניצקי" },
  { name: "הרצוג פוקס", logo: "/v6-assets/sponsors/herzog.png" },
  { name: "גושן ארנון" },
];

const PROJECTS: Project[] = [
  { img: "1545324418-cc1a3fa10c00", tag: "התחדשות עירונית", title: "פינוי‑בינוי, גבעת שמואל", desc: "שיתוף פעולה בין 3 יזמים שנפגשו בקהילה. 240 יחידות.", period: "2024 — היום", partners: "3 שותפים" },
  { img: "1486406146926-c627a92ad1ab", tag: "קרקע יזמית", title: "מתחם מסחרי, ראש העין", desc: "קבוצת השקעה של 14 חברי קהילה. הון של 28M ש״ח.", period: "2023", partners: "14 שותפים" },
  { img: "1448630360428-65456885c650", tag: "מגדל יוקרה", title: "מגדל הברזל, רמת גן", desc: "שותפות יזמית בין שני חברים. 32 קומות, מסחר ומגורים.", period: "2022 — 2025", partners: "2 שותפים" },
  { img: "1582407947304-fd86f028f716", tag: "קומבינציה", title: "קרן חוב נדל״ן", desc: "קרן שהוקמה על ידי 4 חברי קהילה. 120M ש״ח גיוס ראשון.", period: "2024", partners: "4 שותפים" },
];

const PODCASTS: { title: string; desc: string; img: string }[] = [
  { img: "1589903308904-1010c2294adc", title: "ריבית, אינפלציה ונדל״ן – מה שמישהו צריך לומר", desc: "שרון אוחנה ונועם כרמי מנתחים את ההחלטות של בנק ישראל ומה הן אומרות למי שמחזיק נכסים." },
  { img: "1590602847861-f357a9332bbc", title: "נדל״ן בדובאי: האמת מאחורי הבאז", desc: "שרון אוחנה ואלון בן-דוד מגיעים ישירות מדובאי עם תובנות שלא תשמעו בשום מקום אחר." },
  { img: "1478737270239-2f02b77fc618", title: "פינוי בינוי: הכסף הגדול שכולם מפספסים", desc: "שרון אוחנה בשיחה עם נועם כרמי על למה רוב היזמים נכנסים לפינוי‑בינוי מאוחר מדי – ואיך עושים את זה נכון." },
  { img: "1598488035139-bdbb2231ce04", title: "האם שוק הנדל״ן בישראל עומד לפני תיקון?", desc: "שרון אוחנה ואלון בן-דוד דנים בסיכונים ובהזדמנויות שמביאה עמה תקופת חוסר הוודאות." },
];

const SECONDARY_ARTICLES: ArticleItem[] = [
  { cat: "רגולציה", title: "חוק התחדשות עירונית 2026 — מה צריך לדעת", desc: "כל מה שיזמים ובעלי דירות חייבים להבין לפני שנכנסים לפרויקט.", author: "עו״ד דניאל כהן", time: "9 דק׳" },
  { cat: "פרופטק", title: "5 פלטפורמות שמשנות את עולם המכרזים", desc: "הכלים הדיגיטליים שמקצרים את הדרך מהמכרז ועד הזכייה.", author: "שירה אלוני", time: "6 דק׳" },
  { cat: "מימון", title: "קרנות חוב נדל״ן — איך לבחור נכון", desc: "מה ההבדל בין הקרנות, ואיך מזהים את הסיכון האמיתי.", author: "רן מימון", time: "11 דק׳" },
];

const EVENTS: EventItem[] = [
  { day: "28", month: "מאי", tag: "ארוחת ערב סגורה", title: "שולחן עגול — יזמי התחדשות עירונית", desc: "20 יזמים. שולחן אחד. נושאים חמים בתעשייה. רק לחברי קהילה.", place: "מסעדת מסה, תל אביב", time: "20:00" },
  { day: "04", month: "יוני", tag: "מאסטרקלאס", title: "קרנות חוב פרטיות — A to Z", desc: "שלוש שעות עומק עם מנהלי שלוש הקרנות המובילות בארץ.", place: "WeWork גינדי, ת״א", time: "09:30" },
  { day: "14", month: "יוני", tag: "הכנס השנתי", accent: true, title: "כנס הנדלניסטים 2026", desc: "היום הגדול של הקהילה. 42 מרצים. 3 פאנלים. 800 משתתפים.", place: "אקספו תל אביב", time: "09:00 — 21:00" },
  { day: "02", month: "יולי", tag: "סיור מקצועי", title: "סיור בפרויקטים החדשים בתל אביב", desc: "סיור מודרך עם היזמים — ארבעה מגדלים בלב העיר.", place: "נקודת מפגש — שרונה", time: "16:00" },
];

const PAST_EVENTS = [
  { tag: "הכנס השנתי", title: "כנס הנדלניסטים 2025", desc: "יום שלם של פאנלים, עסקאות ונטוורקינג עם מיטב אנשי הענף.", place: "אקספו תל אביב", time: "מאי 2025" },
  { tag: "משלחת בינלאומית", title: "משלחת נדל״ן לדובאי", desc: "חמישה ימים, עשרים חברי קהילה, ושוק שמשנה את כללי המשחק.", place: "דובאי, איחוד האמירויות", time: "מרץ 2025" },
  { tag: "ערב חברים", title: "חמש שנים לקהילה — ערב גאלה", desc: "חגגנו חמש שנים יחד עם כל מי שבנה את הקהילה מהיום הראשון.", place: "האנגר 11, נמל ת״א", time: "דצמבר 2024" },
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

function useHeroIntro() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".v6-hero");
    if (!hero) return;
    const id = requestAnimationFrame(() => hero.classList.add("is-loaded"));
    return () => cancelAnimationFrame(id);
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
  // crosses into a neighbour — invisibly, since every copy looks the same.
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
  // transition — the jump is invisible because the copies are identical.
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

  // Gentle 5s auto-advance — eased via CSS transition, paused on hover.
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
          {rendered.map((m, i) => (
            <article key={`${m.title}-${i}`} className="v6-member v6-glass">
              <div className="v6-member__count">{m.count}</div>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
              <div className="v6-member__avatars" aria-hidden>
                {m.avatars.map((a) => (
                  <span key={a} style={{ backgroundImage: `url(https://i.pravatar.cc/80?img=${a})` }} />
                ))}
              </div>
            </article>
          ))}
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
        <img key={`meet-img-${i}`} src={`https://images.unsplash.com/photo-${p.img}?w=1000&q=80`} alt={p.name} />
      </figure>
      <div className="v6-story__body">
        <span className="v6-meet__eyebrow"><span className="v6-dot" />הכר את הנדלניסט</span>
        <div className="v6-meet__slide" key={`meet-${i}`}>
          <blockquote>{p.quote}</blockquote>
          <div className="v6-story__by">
            <div>
              <div className="v6-story__name">{p.name}</div>
              <div className="v6-story__role">{p.role}</div>
            </div>
          </div>
        </div>
        <div className="v6-cardfoot">
          <a href="#" className="v6-btn v6-btn--glass v6-cardcta">לפרטים</a>
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
        <img key={`job-img-${i}`} src={`https://images.unsplash.com/photo-${j.img}?w=1100&q=80`} alt="" />
        <span className="v6-jobrot__badge">משרה פתוחה</span>
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
          <a href="#" className="v6-btn v6-btn--glass v6-cardcta">לפרטים</a>
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

function CommunitiesCarousel({ items }: { items: { id: number; logo: string; label: string }[] }) {
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
            <div key={`${c.id}-${i}`} className="v6-comm">
              <div className="v6-comm__logo"><img src={c.logo} alt="" /></div>
              <span className="v6-comm__label">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
      <button type="button" className="v6-members__arrow v6-members__arrow--next v6-glass" aria-label="הקהילה הבאה" onClick={() => go(1)}>
        <ChevronLeft />
      </button>
    </div>
  );
}

export default function HomePageV6() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const scrolled = useScrolled();
  useHeroIntro();
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
      <header className={`v6-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="v6-nav__inner v6-glass">
          <button className="v6-nav__menu" aria-label="פתח תפריט" onClick={() => setDrawerOpen(true)}>
            <span /><span /><span />
          </button>
          <a href="#top" className="v6-nav__logo" aria-label="הנדלניסטים — דף הבית">
            <img src="/v6-assets/logo.png" alt="הנדלניסטים" />
          </a>
          <nav className="v6-nav__links" aria-label="ניווט ראשי">
            {NAV_LINKS.map(([href, label]) => (
              <a key={label} href={href}>{label}</a>
            ))}
          </nav>
          <a href="#contact" className="v6-btn v6-btn--primary v6-nav__cta" data-magnetic="">
            <span className="v6-nav__cta-long">Members Only</span>
            <span className="v6-nav__cta-short">Members</span>
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
          <a href="#contact" className="v6-btn v6-btn--primary v6-btn--lg v6-btn--block v6-drawer__cta" onClick={closeDrawer}>
            <span>Members Only</span>
            <ArrowIcon />
          </a>
        </div>
      </div>

      {/* Hero */}
      <section className="v6-hero" id="top">
        <div className="v6-hero__media" data-parallax="0.3">
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=2400&q=80"
            alt=""
          />
          <div className="v6-hero__veil" />
        </div>
        <div className="v6-hero__glow" aria-hidden />

        <div className="v6-hero__content">
          <h1 className="v6-hero__title">
            <span className="v6-line"><span>הקהילה</span></span>
            <span className="v6-line"><span>שמחברת את עולם</span></span>
            <span className="v6-line"><span><em>הנדל״ן בישראל</em></span></span>
          </h1>
          <p className="v6-hero__sub">
            מקום אחד ליזמים, משקיעים, שמאים, עו״ד, קבלנים, אדריכלים<br />
            ובעלי מקצוע — ליצור קשרים, ללמוד, להתפתח ולייצר הזדמנויות אמיתיות.
          </p>
          <div className="v6-hero__cta">
            <a href="#contact" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic="">
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

        <div className="v6-marquee" aria-hidden>
          <div className="v6-marquee__track">
            {[...MARQUEE, ...MARQUEE].map((term, i) => (
              <Fragment key={i}>
                <span>{term}</span>
                <span className="v6-diamond">◆</span>
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsorship strip */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="v6-sponsorstrip v6-glass" data-reveal>
            <span className="v6-sponsorstrip__title">Sponsorship#1</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="v6-section">
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--stats" data-reveal>
            <span className="v6-eyebrow"><span className="v6-dot" />הקהילה במספרים</span>
            <h2>קהילה גדולה. <em>השפעה אמיתית.</em></h2>
          </header>
          <div className="v6-stats__grid">
            {STATS.map((s) => (
              <div key={s.label} className="v6-stat v6-glass" data-reveal>
                <div className="v6-stat__num" data-count={s.count} data-suffix={s.suffix}>0{s.suffix}</div>
                <div className="v6-stat__label">{s.label}</div>
                <div className="v6-stat__bar">
                  <span style={{ ["--w" as never]: s.width } as React.CSSProperties} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="v6-section" id="about">
        <div className="v6-container">
          <div className="v6-about__grid">
            <div className="v6-about__text">
              <span className="v6-eyebrow" data-reveal><span className="v6-dot" />מי אנחנו</span>
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
              <ul className="v6-about__list" data-reveal>
                {ABOUT_BULLETS.map(([n, text]) => (
                  <li key={n}><span>{n}</span>{text}</li>
                ))}
              </ul>
            </div>
            <div className="v6-about__media" data-reveal>
              <figure className="v6-about__img v6-about__img--lg" data-parallax="0.1">
                <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80" alt="" />
              </figure>
              <figure className="v6-about__img v6-about__img--sm" data-parallax="0.2">
                <img src="https://images.unsplash.com/photo-1559223607-a43c990c692c?w=900&q=80" alt="" />
              </figure>
              <div className="v6-about__badge v6-glass">
                <div className="v6-about__badge-num">7</div>
                <div className="v6-about__badge-text">שנים<br />של קהילה</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Communities */}
      <section className="v6-section" id="communities">
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--comm" data-reveal>
            <h2>הקהילות של <em>הנדלניסטים</em></h2>
          </header>
          <CommunitiesCarousel items={COMMUNITIES} />
        </div>
      </section>

      {/* Members */}
      <section className="v6-section" id="members">
        <div className="v6-container">
          <header className="v6-section-head" data-reveal>
            <span className="v6-eyebrow"><span className="v6-dot" />חברי הקהילה</span>
            <h2>הערך הוא <em>האנשים</em>.</h2>
            <p className="v6-section-head__sub">עשרה עולמות מקצועיים. אלפי אנשי מקצוע. גג אחד.</p>
          </header>
          <MembersCarousel items={MEMBERS} />
        </div>
      </section>

      {/* Meet the Nadlanist */}
      <section className="v6-section">
        <div className="v6-container">
          <NadlanistCarousel people={NADLANISTIM} />
        </div>
      </section>

      {/* Events (duplicate, above Stories) */}
      <section className="v6-section">
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--row" data-reveal>
            <div>
              <span className="v6-eyebrow"><span className="v6-dot" />אירועים קרובים</span>
              <h2>אירועי נדלניסטים <em>הקרובים</em></h2>
            </div>
            <a href="#" className="v6-link-arrow">
              <span>כל האירועים</span>
              <ArrowIcon />
            </a>
          </header>
          <div className="v6-events__list">
            {EVENTS.slice(0, 3).map((e) => (
              <article key={e.title} className="v6-event v6-glass" data-reveal>
                <div className="v6-event__date">
                  <span className="v6-event__day">{e.day}</span>
                  <span className="v6-event__month">{e.month}</span>
                </div>
                <div className="v6-event__body">
                  <span className={`v6-event__tag${e.accent ? " v6-event__tag--accent" : ""}`}>{e.tag}</span>
                  <h3>{e.title}</h3>
                  <p>{e.desc}</p>
                  <div className="v6-event__meta">
                    <span>{e.place}</span><span>·</span><span>{e.time}</span>
                  </div>
                </div>
                <a href="#" className="v6-event__cta">
                  <span>הירשמו</span>
                  <ArrowIcon />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Featured event */}
      <section className="v6-featured" id="featured">
        <div className="v6-featured__bg" data-parallax="0.25">
          <img src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=2400&q=80" alt="" />
        </div>
        <div className="v6-container v6-featured__grid">
          <div className="v6-featured__text">
            <span className="v6-eyebrow" data-reveal><span className="v6-dot" />האירוע המרכזי</span>
            <div className="v6-featured__date" data-reveal>
              <div><span>14</span>יוני</div>
              <div className="v6-featured__date-sep" />
              <div><span>2026</span>תל אביב</div>
            </div>
            <h2 className="v6-featured__title" data-reveal>
              כנס הנדלניסטים<br /><em>השנתי 2026</em>
            </h2>
            <p className="v6-featured__desc" data-reveal>
              12 שעות של פאנלים, מאסטרקלאסים ונטוורקינג בלב תל אביב.
              עם הדמויות המובילות בענף — יזמים, משקיעים, רגולטורים ומקבלי החלטות.
            </p>
            <div className="v6-featured__speakers" data-reveal>
              <div className="v6-featured__speakers-imgs">
                {[12, 22, 32, 42, 52].map((n) => (
                  <span key={n} style={{ backgroundImage: `url(https://i.pravatar.cc/120?img=${n})` }} />
                ))}
              </div>
              <div className="v6-featured__speakers-text">
                <strong>+42 מרצים</strong><br />מהמובילים בענף הנדל״ן הישראלי
              </div>
            </div>
            <div className="v6-featured__cta" data-reveal>
              <a href="#" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic="">
                <span>הירשמו לכנס</span>
                <ArrowIcon />
              </a>
              <a href="#" className="v6-btn v6-btn--glass v6-btn--lg" data-magnetic="">תוכנית הכנס</a>
              <a href="#" className="v6-btn v6-btn--glass v6-btn--lg" data-magnetic="">תמונות מהכנס שעבר</a>
            </div>
          </div>
          <aside className="v6-featured__card v6-glass" data-reveal>
            <div className="v6-featured__card-img">
              <img src="https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=900&q=80" alt="" />
            </div>
            <div className="v6-featured__card-body">
              {FEATURED_DETAILS.map(([k, v]) => (
                <div key={k} className="v6-featured__card-row">
                  <span>{k}</span><strong>{v}</strong>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Deal room (Projects) */}
      <section className="v6-section" id="dealroom">
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--row" data-reveal>
            <div>
              <span className="v6-eyebrow"><span className="v6-dot" />פרויקטים ושיתופי פעולה</span>
              <h2>חדר <em>עסקאות.</em> <span className="v6-tag-members">Members Only</span></h2>
              <p className="v6-section-head__sub">פרויקטים, עסקאות ושיתופי פעולה שנולדו בתוך הקהילה.</p>
            </div>
            <a href="#" className="v6-link-arrow">
              <span>כל ההצעות</span>
              <ArrowIcon />
            </a>
          </header>
          <div className="v6-projects__grid">
            {PROJECTS.map((p) => (
              <article key={p.title} className="v6-project v6-glass" data-reveal>
                <figure className="v6-project__img">
                  <img src={`https://images.unsplash.com/photo-${p.img}?w=900&q=80`} alt="" />
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
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="v6-section" id="stories">
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--center v6-section-head--nowrap" data-reveal>
            <h2>חיבורים שהופכים <em>לעסקאות</em></h2>
          </header>
          <div className="v6-stories__grid">
            <JobRotator jobs={JOB_OFFERS} />
          </div>
        </div>
      </section>

      {/* Sponsorship strip */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="v6-sponsorstrip v6-sponsorstrip--sm v6-glass" data-reveal>
            <span className="v6-sponsorstrip__title">Sponsorship#2</span>
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="v6-section">
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--center" data-reveal>
            <span className="v6-eyebrow"><span className="v6-dot" />שותפים</span>
            <h2>עובדים <em>איתנו.</em></h2>
          </header>
          <div className="v6-sponsors__group" data-reveal>
            <h4 className="v6-sponsors__title">שותפים קבועים</h4>
            <div className="v6-sponsors__logos">
              {SPONSORS_MAIN.map((s) => (
                <div key={s.name} className="v6-sponsors__logo">
                  {s.logo ? <img src={s.logo} alt={s.name} className="v6-sponsors__img" /> : s.name}
                </div>
              ))}
            </div>
          </div>
          <div className="v6-sponsors__group" data-reveal>
            <h4 className="v6-sponsors__title">נותני חסות לאירועים</h4>
            <div className="v6-sponsors__logos v6-sponsors__logos--sm">
              {SPONSORS_EVENT.map((s) => (
                <div key={s.name} className="v6-sponsors__logo">
                  {s.logo ? <img src={s.logo} alt={s.name} className="v6-sponsors__img" /> : s.name}
                </div>
              ))}
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
              <img src="/group-people-new-year-s-party.jpg" alt="" />
            </div>
            <div className="v6-youth__content">
              <p>25 נדלניסטים ונדלניסטיות מתחת לגיל 45 שעוד יכבשו את עולם הנדל״ן של ישראל!</p>
              <a href="#" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic="">
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
              <h2>נדלניסטים <em>כותבים</em></h2>
            </div>
            <a href="#" className="v6-link-arrow">
              <span>כל הכתבות</span>
              <ArrowIcon />
            </a>
          </header>
          <div className="v6-articles__grid">
            <article className="v6-article v6-article--feature v6-glass" data-reveal>
              <figure className="v6-article__img">
                <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80" alt="" />
              </figure>
              <div className="v6-article__body">
                <div className="v6-article__cat">ניתוח שוק</div>
                <h3>איפה נסגרות עכשיו עסקאות הקרקע הכי טובות?</h3>
                <p>מיפוי של 18 חודשים אחרונים בשוק הקרקעות הפרטי — והאזורים שמתחתם הפעילות שקטה אבל הרווחיות גבוהה.</p>
                <div className="v6-article__meta">
                  <span>אלון שמיר</span><span>·</span><span>14 דק׳ קריאה</span><span>·</span><span>מאי 2026</span>
                </div>
              </div>
            </article>
            {SECONDARY_ARTICLES.map((a) => (
              <article key={a.title} className="v6-article v6-glass" data-reveal>
                <div className="v6-article__cat">{a.cat}</div>
                <h3>{a.title}</h3>
                <p className="v6-article__excerpt">{a.desc}</p>
                <div className="v6-article__meta">
                  <span>{a.author}</span><span>·</span><span>{a.time}</span>
                </div>
              </article>
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
              <h2>שיחות שאסור <em>לפספס.</em></h2>
              <p className="v6-section-head__sub">שיחות עומק עם האנשים שמזיזים את שוק הנדל״ן בישראל.</p>
            </div>
            <a href="#" className="v6-link-arrow">
              <span>כל הפרקים</span>
              <ArrowIcon />
            </a>
          </header>
          <div className="v6-podcasts__grid">
            {PODCASTS.map((p) => (
              <article key={p.title} className="v6-podcast v6-glass" data-reveal>
                <figure className="v6-podcast__img">
                  <img src={`https://images.unsplash.com/photo-${p.img}?w=900&q=80`} alt="" />
                </figure>
                <div className="v6-podcast__body">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <a href="#" className="v6-link-arrow v6-podcast__cta">
                    <span>לשמיעה</span>
                    <ArrowIcon />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="v6-section" id="events">
        <div className="v6-container">
          <header className="v6-section-head v6-section-head--row" data-reveal>
            <div>
              <span className="v6-eyebrow"><span className="v6-dot" />אירועי עבר</span>
              <h2>חוזרים <em>לרגעים היפים.</em></h2>
            </div>
            <a href="#" className="v6-link-arrow">
              <span>כל האירועים</span>
              <ArrowIcon />
            </a>
          </header>
          <div className="v6-events__list">
            {PAST_EVENTS.map((e) => (
              <article key={e.title} className="v6-event v6-event--nodate v6-glass" data-reveal>
                <div className="v6-event__body">
                  <span className="v6-event__tag">{e.tag}</span>
                  <h3>{e.title}</h3>
                  <p>{e.desc}</p>
                  <div className="v6-event__meta">
                    <span>{e.place}</span><span>·</span><span>{e.time}</span>
                  </div>
                </div>
                <a href="#" className="v6-event__cta">
                  <span>לתמונות</span>
                  <ArrowIcon />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

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
            <div className="v6-contact__channels" data-reveal>
              <a href="#" className="v6-contact__channel v6-glass" data-magnetic="">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2.6-1.3a.8.8 0 0 0-.9.1l-1.2 1.2c-1.9-.9-3.4-2.4-4.3-4.3l1.2-1.2a.8.8 0 0 0 .1-.9L8.5 5.4a.8.8 0 0 0-.9-.4l-2.3.6a.8.8 0 0 0-.6.8c0 5.9 4.8 10.7 10.7 10.7a.8.8 0 0 0 .8-.6l.6-2.3a.8.8 0 0 0-.4-.9z" /></svg>
                <span>וואטסאפ</span>
              </a>
              <a href="#" className="v6-contact__channel v6-glass" data-magnetic="">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
                <span>אינסטגרם</span>
              </a>
              <a href="#" className="v6-contact__channel v6-glass" data-magnetic="">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3a5 5 0 0 0 4 4.2v3a8 8 0 0 1-4-1.2v5.6a6 6 0 1 1-6-6c.34 0 .67.03 1 .08v3.18a3 3 0 1 0 2 2.82V3h3z" /></svg>
                <span>טיקטוק</span>
              </a>
              <a href="mailto:hello@nadlanistim.co.il" className="v6-contact__channel v6-glass" data-magnetic="">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
                <span>אימייל</span>
              </a>
            </div>
          </div>

          <form
            className={`v6-contact__form v6-glass${sent ? " sent" : ""}`}
            data-reveal
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <h3>הרשמה לקהילה</h3>
            <div className="v6-field">
              <label htmlFor="f-name">שם מלא</label>
              <input id="f-name" type="text" required placeholder="ישראלה ישראלי" />
            </div>
            <div className="v6-field-row">
              <div className="v6-field">
                <label htmlFor="f-phone">טלפון</label>
                <input id="f-phone" type="tel" required placeholder="050-0000000" />
              </div>
              <div className="v6-field">
                <label htmlFor="f-email">אימייל</label>
                <input id="f-email" type="email" required placeholder="you@company.com" />
              </div>
            </div>
            <div className="v6-field">
              <label htmlFor="f-role">תחום עיסוק</label>
              <select id="f-role" required defaultValue="">
                <option value="">בחרו תחום…</option>
                {ROLE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <label className="v6-contact__consent" htmlFor="f-consent">
              <input id="f-consent" type="checkbox" required />
              <span>מוסכמים עלי מדיניות הפרטיות של האתר וקבלת דיוורים מהקהילה.</span>
            </label>
            <button type="submit" className="v6-btn v6-btn--primary v6-btn--block v6-btn--lg" data-magnetic="">
              <span>שליחת בקשה</span>
              <ArrowIcon />
            </button>
            <div className="v6-contact__sent-msg">
              <strong>הבקשה נשלחה. ✓</strong>
              <span>נחזור אליך תוך 24 שעות.</span>
            </div>
          </form>
        </div>
      </section>

      {/* Sponsorship strip */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="v6-sponsorstrip v6-glass" data-reveal>
            <span className="v6-sponsorstrip__title">Sponsorship#3</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="v6-footer">
        <div className="v6-container">
          <div className="v6-footer__top">
            <div className="v6-footer__brand">
              <div className="v6-footer__logo">
                <img src="/v6-assets/logo.png" alt="הנדלניסטים" />
              </div>
              <p>הקהילה המקצועית של ענף הנדל״ן בישראל.<br />קשרים. אירועים. הזדמנויות.</p>
            </div>
            <div className="v6-footer__cols">
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
          <div className="v6-footer__bottom">
            <span>© 2026 הנדלניסטים. כל הזכויות שמורות.</span>
            <span className="v6-footer__legal">
              <a href="#">תנאי שימוש</a>
              <a href="#">פרטיות</a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
