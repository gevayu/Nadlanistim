import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Ticket } from "lucide-react";
import FeaturedSlider from "@/components/FeaturedSlider";
import SponsorBanner from "@/components/SponsorBanner";
import Carousel from "@/components/Carousel";

export default function HomePage() {
  const postsCarousel = [
    {
      href: "/posts/interest-rate-impact",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
      imageAlt: "אווירת נדלן",
      title: "השפעת הריבית על שוק הנדל״ן",
      description:
        "בצל שינויי הריבית האחרונים של בנק ישראל, יזמים רבים מחשבים מסלול מחדש.",
    },
    {
      href: "/posts/construction-trends-2026",
      image:
        "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&q=80&w=600",
      imageAlt: "מגמות בנייה",
      title: "מגמות בנייה לקראת 2026",
      description:
        "התייקרות חומרי הגלם מול טכנולוגיות בנייה חדשות שמנסות לשבור את השוק.",
    },
    {
      href: "/posts/periphery-investments",
      image:
        "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=600",
      imageAlt: "השקעות בפריפריה",
      title: "מהפכת ההשקעות בפריפריה",
      description: "האם התשואה בצפון ובדרום באמת מפצה על הסיכון התכנוני?",
    },
    {
      href: "/posts/alternative-digital-real-estate",
      image:
        "https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=600",
      imageAlt: "נדל״ן דיגיטלי",
      title: "השקעות אלטרנטיביות: נדל״ן דיגיטלי?",
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

  const partnerships = [
    {
      href: "#",
      image:
        "https://images.unsplash.com/photo-1570126127658-5360662657e4?auto=format&fit=crop&q=80&w=800",
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
        <div className="container hero-content reveal active">
          <SponsorBanner size="large" />

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
              <div className="tag">
                <span className="dot" /> הבית של אנשי המקצוע
              </div>
              <h1 className="hero-title">
                <span className="text-outline">העתיד של הנדל״ן.</span>
                <span className="filled">כבר כאן.</span>
              </h1>
              <p className="hero-desc">
                לא עוד רשתות חברתיות רועשות. זירה אקסקלוסיבית ליזמים, משקיעים
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

      <main className="container">
        <div className="bento-grid">
          <FeaturedSlider />

          <div
            className="bento-card card-stats reveal"
            style={{ transitionDelay: "0.1s" }}
          >
            <div className="stat-group">
              <span className="num">
                12K<span style={{ color: "var(--text-pure)" }}>+</span>
              </span>
              <span className="label">מוחות מבריקים בקהילה</span>
            </div>
            <div
              style={{
                width: "100%",
                height: 1,
                background: "var(--border-dim)",
              }}
            />
            <div className="stat-group">
              <span
                className="num"
                style={{
                  fontSize: "4.5rem",
                  color: "var(--accent-purple)",
                  textShadow: "0 0 30px rgba(176,0,173,0.4)",
                }}
              >
                ₪1B+
              </span>
              <span className="label">היקף עסקאות משוער</span>
            </div>
          </div>

          <div
            className="card-actions reveal"
            style={{ transitionDelay: "0.2s", padding: 0 }}
          >
            <a href="#" className="action-btn">
              <Image
                src="/1.png"
                alt="משרות פרימיום"
                width={48}
                height={48}
                className="custom-icon"
              />
              <h3>משרות פרימיום</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>
                לוח דרושים אקסקלוסיבי לתפקידי הנהלה ופיתוח.
              </p>
            </a>
            <a href="#" className="action-btn">
              <Image
                src="/2.png"
                alt="פודקאסט"
                width={48}
                height={48}
                className="custom-icon"
              />
              <h3>פודקאסט</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>
                שיחות עומק עם האנשים שמזיזים את הקירות.
              </p>
            </a>
            <a href="#" className="action-btn">
              <Image
                src="/4.png"
                alt="נטוורקינג"
                width={48}
                height={48}
                className="custom-icon"
              />
              <h3>נטוורקינג</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>
                גישה ישירה למקבלי החלטות במשק.
              </p>
            </a>
            <a href="#" className="action-btn">
              <Image
                src="/6.png"
                alt="זירת עסקאות"
                width={48}
                height={48}
                className="custom-icon"
              />
              <h3>זירת עסקאות</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>
                חיבור בין הון ליזמות מתחת לרדאר.
              </p>
            </a>
          </div>

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
                <div
                  className="tag"
                  style={{
                    background: "var(--accent-green)",
                    color: "#000",
                    border: "none",
                    alignSelf: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <Image
                    src="/4.png"
                    alt=""
                    width={27}
                    height={27}
                    className="custom-icon-sm"
                    style={{ marginInlineEnd: 8 }}
                  />{" "}
                  כנס הדגל
                </div>
                <h2 style={{ marginBottom: 16 }}>פסגת הנדל״ן של ישראל 2026</h2>
                <p
                  style={{
                    fontSize: "1.3rem",
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
                    fontSize: "1.1rem",
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

          <article className="bento-card card-profile reveal">
            <div>
              <div
                className="tag"
                style={{
                  marginBottom: 24,
                  background: "transparent",
                  borderColor: "var(--border-dim)",
                  color: "var(--text-pure)",
                }}
              >
                <Image
                  src="/1.png"
                  alt=""
                  width={27}
                  height={27}
                  className="custom-icon-sm"
                  style={{ marginInlineEnd: 8 }}
                />{" "}
                הכירו את הנדלניסט
              </div>
              <p className="quote">
                &quot;היכולת לקחת עסקה שעל פניו נראית לא הגיונית ולמצוא פתרונות
                יצירתיים בעזרת חשיבה מחוץ לקופסא וניסיון מקצועי, ובכך להצליח
                לייצר עסקה כדאית לצדדים, זה מה שגורם לי אושר בסוף יום עבודה&quot;
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Image
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200"
                alt="רז אברהם"
                width={80}
                height={80}
                className="avatar-huge"
              />
              <div>
                <h3 style={{ marginBottom: 4 }}>רז אברהם</h3>
                <p
                  style={{
                    color: "var(--accent-primary)",
                    fontWeight: 500,
                    marginBottom: 4,
                  }}
                >
                  שותף במשרד שמאים
                </p>
                <p style={{ color: "var(--text-dim)", fontSize: "0.95rem" }}>
                  תמם אברהם שמאות מקרקעין
                </p>
              </div>
            </div>
          </article>

          <article
            className="bento-card card-news reveal"
            style={{ transitionDelay: "0.1s" }}
          >
            <div className="news-content">
              <div className="tag" style={{ marginBottom: 20 }}>
                <span
                  className="dot"
                  style={{ background: "var(--accent-green)" }}
                />{" "}
                השקעות
              </div>
              <h3>הזדמנויות מעבר לים: מדריך 2026</h3>
              <p
                style={{
                  color: "var(--text-dim)",
                  marginBottom: 30,
                  fontSize: "1.1rem",
                }}
              >
                מיוון ועד דובאי: איפה באמת כדאי לשים את הכסף עכשיו? פאנל מומחים
                מיוחד סוקר את מפת הסיכונים העולמית.
              </p>
              <Link
                href="/posts/overseas-opportunities-2026"
                style={{
                  color: "var(--text-pure)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                לצפייה בפאנל <ArrowLeft size={18} />
              </Link>
            </div>
            <div className="news-img">
              <Image
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"
                alt="השקעות בחול"
                width={800}
                height={600}
                sizes="(max-width: 1200px) 45vw, 30vw"
              />
            </div>
          </article>
        </div>
      </main>

      <div className="container">
        <SponsorBanner size="small" />
      </div>

      <section className="container carousels-container">
        <Carousel
          title="נדלניסטים ברשת"
          icon="/2.png"
          iconAlt="נדלניסטים ברשת"
          viewAllHref="#"
          items={postsCarousel}
        />
        <Carousel
          title="משרות פתוחות"
          icon="/4.png"
          iconAlt="משרות פתוחות"
          viewAllHref="#"
          items={jobsCarousel}
        />
        <Carousel
          title="שיתופי פעולה חדשים"
          icon="/6.png"
          iconAlt="שיתופי פעולה"
          viewAllHref="#"
          items={partnerships}
        />
      </section>

      <div className="container">
        <SponsorBanner size="large" />
      </div>
    </>
  );
}
