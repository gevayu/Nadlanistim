import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Ticket } from "lucide-react";
import SponsorBanner from "@/components/SponsorBanner";
import Carousel from "@/components/Carousel";
import NewsTicker from "@/components/NewsTicker";
import MeetNadlanist from "@/components/MeetNadlanist";
import RotatingNewsCard from "@/components/RotatingNewsCard";

export default function HomePageV2() {
  const postsCarousel = [
    {
      href: "/posts/interest-rate-impact",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
      imageAlt: "אווירת נדלן",
      title: "השפעת הריבית על שוק הנדל״ן",
      author: "משה זוכמיר",
      company: "זוכמיר נדל״ן",
      description:
        "בצל שינויי הריבית האחרונים של בנק ישראל, יזמים רבים מחשבים מסלול מחדש.",
    },
    {
      href: "/posts/construction-trends-2026",
      image:
        "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&q=80&w=600",
      imageAlt: "מגמות בנייה",
      title: "מגמות בנייה לקראת 2026",
      author: "רנה אביב",
      company: "קבוצת אביב יזמות",
      description:
        "התייקרות חומרי הגלם מול טכנולוגיות בנייה חדשות שמנסות לשבור את השוק.",
    },
    {
      href: "/posts/periphery-investments",
      image:
        "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=600",
      imageAlt: "השקעות בפריפריה",
      title: "מהפכת ההשקעות בפריפריה",
      author: "אייל שמש",
      company: "שמש הון ונדל״ן",
      description: "האם התשואה בצפון ובדרום באמת מפצה על הסיכון התכנוני?",
    },
    {
      href: "/posts/alternative-digital-real-estate",
      image:
        "https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=600",
      imageAlt: "נדל״ן דיגיטלי",
      title: "השקעות אלטרנטיביות: נדל״ן דיגיטלי?",
      author: "נועה גולן",
      company: "גולן אסטייטס",
      description: "האם עולם הנדל״ן עומד להשתנות בעקבות הדיגיטציה של נכסים?",
    },
  ];

  const jobsCarousel = [
    {
      href: "/jobs/bd-project-manager",
      image:
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=600",
      imageAlt: "פגישת עבודה",
      title: "מנהל/ת פרויקטים בנדל״ן",
      description:
        "לחברה יזמית מובילה באזור המרכז דרוש/ה מנהל/ת פרויקטים להובלת מיזמי פינוי בינוי.",
    },
    {
      href: "/jobs/bd-project-manager",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600",
      imageAlt: "דיון משרד",
      title: "שמאי/ת מקרקעין בכיר/ה",
      description:
        "פירמת שמאות גדולה מגייסת שמאי/ת מקרקעין לליווי פיננסי ועריכת דוחות אפס.",
    },
    {
      href: "/jobs/bd-project-manager",
      image:
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=600",
      imageAlt: "ניתוח נתונים",
      title: "סמנכ״ל/ית פיתוח עסקי",
      description:
        "הזדמנות נדירה להשתלב בהנהלת קרן השקעות נדל״ן בצמיחה באיתור קרקעות.",
    },
    {
      href: "/jobs/bd-project-manager",
      image:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600",
      imageAlt: "שיווק נדלן",
      title: "מנהל/ת שיווק ומכירות",
      description:
        "דרוש/ה מנהל/ת שיווק מנוסה להובלת קמפיינים שיווקיים עבור פרויקטים רחבי היקף.",
    },
  ];

  const podcastEpisodes = [
    {
      href: "#",
      image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=600",
      imageAlt: "פרק פודקאסט",
      title: "האם שוק הנדל״ן בישראל עומד לפני תיקון?",
      description: "שרון אוחנה ואלון בן-דוד דנים בסיכונים ובהזדמנויות שמביאה עמה תקופת חוסר הודאות הנוכחית.",
    },
    {
      href: "#",
      image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=600",
      imageAlt: "פרק פודקאסט",
      title: "פינוי בינוי: הכסף הגדול שכולם מפספסים",
      description: "שרון אוחנה בשיחה עם נועם כרמי על למה רוב היזמים נכנסים לפינוי-בינוי מאוחר מדי — ואיך לשנות את זה.",
    },
    {
      href: "#",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
      imageAlt: "פרק פודקאסט",
      title: "נדל״ן בדובאי: האמת מאחורי הבאז",
      description: "שרון אוחנה ואלון בן-דוד מגיעים ישירות מדובאי עם תובנות שלא תשמעו בשום מקום אחר.",
    },
    {
      href: "#",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600",
      imageAlt: "פרק פודקאסט",
      title: "ריבית, אינפלציה ונדל״ן — מה שמישהו צריך לומר",
      description: "שרון אוחנה ונועם כרמי מנתחים את ההחלטות של בנק ישראל ומה הן אומרות למי שמחזיק נכסים.",
    },
  ];

  const partnerships = [
    {
      href: "#",
      image:
        "https://images.unsplash.com/photo-1541976590-713941681591?auto=format&fit=crop&q=80&w=800",
      imageAlt: "פרויקט בנייה מודרני",
      title: "שת״פ עם חברת בנייה מובילה",
      description:
        "הזדמנות בלעדית לחברי הקהילה: הצטרפו למיזם משותף במסגרת פרויקט מסחרי.",
    },
    {
      href: "#",
      image:
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=600",
      imageAlt: "פרויקט בנייה",
      title: "מיזם משותף בהתחדשות עירונית",
      description:
        "קבוצת יזמים מחפשת משקיע שותף לקידום מתחם פינוי בינוי באזור השרון.",
    },
    {
      href: "#",
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600",
      imageAlt: "שכונת יוקרה",
      title: "קרן השקעות חדשה לקהילה",
      description:
        "משיקים מסלול השקעה מותאם אישית לחברי ״הנדלניסטים״ במינימום כניסה נמוך.",
    },
    {
      href: "#",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
      imageAlt: "פינטק",
      title: "שיתוף פעולה עם פלטפורמת פינטק",
      description:
        "מהלך אסטרטגי המאפשר לחברי הקהילה לקבל פתרונות מימון מהירים וחכמים.",
    },
  ];

  return (
    <>
      <div className="container" style={{ paddingTop: 0, paddingBottom: 0 }}>
      <div className="hero-stats-row">
        <section className="hero-section">
          <Image
            src="/image_056f1a.png"
            alt=""
            width={1200}
            height={1200}
            className="hero-bg-element"
            aria-hidden
          />
          <Image
            src="/image_0518e6.png"
            alt=""
            width={400}
            height={400}
            className="hero-bg-element-2"
            aria-hidden
          />
          <div className="hero-content reveal active">
            <div className="hero-main-row">
              <div className="hero-logo-side">
                <Image
                  src="/black_logo.png"
                  alt="לוגו הנדלניסטים הגדול"
                  width={550}
                  height={550}
                  priority
                />
              </div>
              <div className="hero-text-side">
                <h1 className="hero-title" style={{ whiteSpace: "nowrap" }}>
                  <span className="filled">העתיד של הנדל״ן. כבר כאן.</span>
                </h1>
                <p className="hero-desc">
                  לא עוד רשתות חברתיות רועשות. זירה אקסלוסיבית ליזמים, משקיעים
                  ואנשי מקצוע שבאים לעשות עסקים ולשנות את קו הרקיע של ישראל.
                </p>

                <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
                  <button className="btn btn-primary">
                    כניסה לזירה <ArrowLeft />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="hero-stats-panel">
          <div className="stat-group">
            <span className="num">
              12K<span style={{ color: "var(--text-pure)" }}>+</span>
            </span>
            <span className="label">מוחות מבריקים<br />בקהילה</span>
          </div>
          <div style={{ width: "100%", height: 1, background: "var(--border-dim)" }} />
          <div className="stat-group">
            <span
              className="num"
              style={{
                fontSize: "4.5rem",
                color: "var(--accent-primary)",
                textShadow: "0 0 30px rgba(37,99,235,0.4)",
              }}
            >
              ₪1B+
            </span>
            <span className="label">היקף עסקאות<br />משוער</span>
          </div>
        </div>
      </div>
      </div>

      <div className="container" style={{ paddingTop: 0, paddingBottom: 0, marginTop: 0 }}>
        <NewsTicker />
      </div>

      <div className="container" style={{ paddingTop: 0, paddingBottom: 0, marginTop: 30 }}>
        <SponsorBanner size="large" number={1} />
      </div>

      <main className="container" style={{ marginTop: 20 }}>
        <div className="bento-grid">
          <MeetNadlanist />

          <RotatingNewsCard delay="0.1s" />

          <article className="bento-card card-event reveal">
            <div className="animated-border-bg" />
            <div className="inner-bg" />
            <div className="event-content" style={{ alignItems: "stretch" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <h2 style={{ marginBottom: 16, whiteSpace: "nowrap" }}>פסגת הנדל״ן של ישראל 2026</h2>
                <p
                  style={{
                    color: "var(--text-pure)",
                    maxWidth: 600,
                  }}
                >
                  האירוע שמשנה את כללי המשחק. 3 ימים של הרצאות ומינגלינג ברמה
                  הגבוהה ביותר בישראל.
                </p>
                <div
                  style={{
                    marginTop: 30,
                    display: "flex",
                    gap: 40,
                    color: "#fff",
                  }}
                >
                  <span>
                    <Calendar
                      style={{ marginInlineEnd: 8, display: "inline" }}
                      size={18}
                    />{" "}
                    15-17 במאי, 2026
                  </span>
                  <span>
                    <MapPin
                      style={{ marginInlineEnd: 8, display: "inline" }}
                      size={18}
                    />{" "}
                    אקספו תל אביב
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  paddingBottom: 10,
                  paddingInlineEnd: 20,
                }}
              >
                <button className="btn btn-event">
                  הבטיחו את מקומכם <Ticket />
                </button>
              </div>
            </div>
          </article>

        </div>
      </main>

      <div className="container" style={{ marginTop: 30 }}>
        <SponsorBanner size="small" number={2} />
      </div>

      <div className="container" style={{ marginTop: 30 }}>
        <div className="communities-strip">
          <h2 className="communities-title">הקהילות של הנדלניסטים</h2>
          <div className="communities-circles">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="community-circle">
                <Image src="/community-badge.png" alt="קהילה" fill style={{ objectFit: "cover", borderRadius: "50%" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 30, marginBottom: 30 }}>
        <article className="bento-card card-event card-event-alt reveal">
          <div className="animated-border-bg" style={{ opacity: 0, background: "white" }} />
          <div className="inner-bg" />
          <div className="event-content" style={{ flexDirection: "column", justifyContent: "flex-end" }}>
            <div>
              <h2 style={{ marginBottom: 16 }}>נבחרת הנדלניסטים הצעירים</h2>
              <p style={{ fontSize: "1.3rem", color: "var(--text-pure)", maxWidth: 600 }}>
                25 נדלניסטים ונדלניסטיות מתחת לגיל 45 שעוד יכבשו את עולם הנדל״ן של ישראל!
              </p>
              <div style={{ marginTop: 24 }}>
                <button className="btn btn-event">צפו בפרויקט המיוחד</button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <section className="container carousels-container">
        <Carousel
          title="נדלניסטים כותבים"
          icon="/2.png"
          iconAlt="נדלניסטים כותבים"
          viewAllHref="#"
          items={postsCarousel}
        />
        <Carousel
          title="השקעות"
          icon="/6.png"
          iconAlt="השקעות"
          viewAllHref="#"
          viewAllLabel="לעוד השקעות"
          items={partnerships}
          wrapperClassName="carousel-invert"
        />
        <Carousel
          title="נדלפודקאסט"
          icon="/2.png"
          iconAlt="נדלפודקאסט"
          viewAllHref="#"
          items={podcastEpisodes}
          viewAllLabel="לעוד פרקים"
          readMoreLabel="לשמיעה"
        />
        <Carousel
          title="משרות פתוחות"
          icon="/4.png"
          iconAlt="משרות פתוחות"
          viewAllHref="#"
          items={jobsCarousel}
        />
      </section>

      <div className="container" style={{ marginTop: 60, marginBottom: 60 }}>
        <SponsorBanner size="large" number={3} />
      </div>
    </>
  );
}
