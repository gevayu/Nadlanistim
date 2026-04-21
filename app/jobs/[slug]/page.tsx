import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  Share2,
  Mail,
  Phone,
  Send,
} from "lucide-react";
import { getJob, jobs } from "@/lib/data";
import SponsorBanner from "@/components/SponsorBanner";

export function generateStaticParams() {
  return jobs.map((j) => ({ slug: j.slug }));
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = getJob(slug);
  if (!job) notFound();

  return (
    <main className="job-page container">
      <SponsorBanner size="large" style={{ marginBottom: 40 }} />

      <div className="top-actions reveal">
        <Link href="/" className="back-link">
          <ArrowRight style={{ width: 18 }} /> חזרה ללוח הדרושים
        </Link>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="btn btn-glass"
            style={{ padding: "10px 20px", fontSize: "0.95rem" }}
          >
            <Share2 size={16} /> שיתוף המשרה
          </button>
        </div>
      </div>

      <div
        className="bento-card job-header-card reveal"
        style={{ transitionDelay: "0.1s" }}
      >
        <div className="job-title-wrapper">
          <div
            className="tag"
            style={{
              marginBottom: 20,
              background: "rgba(176,0,173,0.1)",
              borderColor: "rgba(176,0,173,0.2)",
              color: "var(--accent-purple)",
            }}
          >
            <Image
              src="/1.png"
              alt=""
              width={27}
              height={27}
              className="custom-icon-sm"
            />{" "}
            משרה חמה
          </div>
          <h1>{job.title}</h1>
          <p
            style={{
              fontSize: "1.2rem",
              color: "var(--text-dim)",
              maxWidth: 600,
            }}
          >
            {job.subtitle}
          </p>
        </div>
        <div className="job-featured-image">
          <Image
            src={job.heroImage}
            alt={job.heroImageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 350px"
          />
        </div>
      </div>

      <div className="job-grid">
        <div
          className="bento-card job-content-card reveal"
          style={{ transitionDelay: "0.2s" }}
        >
          <h2>
            <Image
              src="/2.png"
              alt=""
              width={48}
              height={48}
              className="custom-icon"
            />{" "}
            תיאור המשרה
          </h2>
          {job.description.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}

          <h2>
            <Image
              src="/4.png"
              alt=""
              width={48}
              height={48}
              className="custom-icon"
            />{" "}
            דרישות עיקריות לתפקיד
          </h2>
          <ul className="requirements-list">
            {job.requirements.map((req) => (
              <li key={req}>{req}</li>
            ))}
          </ul>

          <h2>
            <Image
              src="/6.png"
              alt=""
              width={48}
              height={48}
              className="custom-icon"
            />{" "}
            מה אנחנו מציעים?
          </h2>
          <p>{job.offer}</p>

          <div className="job-tags-container">
            {job.tags.map((tag) => (
              <span
                key={tag.label}
                className="tag"
                style={{ background: "transparent" }}
              >
                <span
                  className="dot"
                  style={{
                    background: tag.color,
                    boxShadow: `0 0 10px ${tag.color}`,
                  }}
                />{" "}
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        <div className="job-sidebar">
          <div
            className="bento-card reveal"
            style={{ transitionDelay: "0.3s", padding: 40 }}
          >
            <ul className="meta-list">
              <li>
                <Image
                  src="/3.png"
                  alt=""
                  width={27}
                  height={27}
                  className="custom-icon-sm"
                />
                <div>
                  <span className="meta-title">פורסם על ידי</span>
                  <span className="meta-value">{job.company}</span>
                </div>
              </li>
              <li>
                <Image
                  src="/3.png"
                  alt=""
                  width={27}
                  height={27}
                  className="custom-icon-sm"
                />
                <div>
                  <span className="meta-title">סוג עבודה</span>
                  <span className="meta-value">{job.employment}</span>
                </div>
              </li>
              <li>
                <Image
                  src="/3.png"
                  alt=""
                  width={27}
                  height={27}
                  className="custom-icon-sm"
                />
                <div>
                  <span className="meta-title">מיקום</span>
                  <span className="meta-value">{job.location}</span>
                </div>
              </li>
              <li>
                <Image
                  src="/3.png"
                  alt=""
                  width={27}
                  height={27}
                  className="custom-icon-sm"
                />
                <div>
                  <span className="meta-title">תאריך פרסום</span>
                  <span className="meta-value">{job.publishedAt}</span>
                </div>
              </li>
            </ul>

            <div className="contact-box">
              <p>שאלות בנוגע למשרה? צרו קשר ישירות:</p>
              <a
                href={`mailto:${job.contactEmail}`}
                className="contact-link"
              >
                <Mail size={18} /> {job.contactEmail}
              </a>
              <a
                href={`tel:${job.contactPhone.replace(/[^\d+]/g, "")}`}
                className="contact-link"
              >
                <Phone size={18} /> {job.contactPhone}
              </a>
            </div>

            <a
              href="#apply-form"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 30 }}
            >
              הגשת מועמדות <ArrowDown size={18} />
            </a>
          </div>

          <div
            className="bento-card reveal"
            style={{
              transitionDelay: "0.4s",
              padding: 30,
              textAlign: "center",
              background:
                "linear-gradient(145deg, rgba(15,15,18,0.4) 0%, rgba(176,0,173,0.1) 100%)",
            }}
          >
            <Image
              src="/5.png"
              alt="קידום"
              width={84}
              height={84}
              className="custom-icon-lg"
            />
            <h3 style={{ marginBottom: 12, fontSize: "1.2rem" }}>
              שדרגו את הפרופיל שלכם
            </h3>
            <p
              style={{
                fontSize: "0.95rem",
                color: "var(--text-dim)",
                marginBottom: 20,
              }}
            >
              חברי פרימיום נהנים מחשיפה מוגברת למעסיקים ולמגייסים המובילים
              במשק.
            </p>
            <a
              href="#"
              className="btn btn-glass"
              style={{ width: "100%", padding: 10 }}
            >
              לפרטים נוספים
            </a>
          </div>
        </div>

        <SponsorBanner
          size="small"
          style={{
            gridColumn: "1 / -1",
            marginTop: 40,
            marginBottom: 0,
          }}
        />

        <div className="bento-card job-form-card reveal" id="apply-form">
          <div className="form-header">
            <h2>הגשת מועמדות למשרה</h2>
            <p style={{ color: "var(--text-dim)", fontSize: "1.1rem" }}>
              מלאו את הפרטים ונציג החברה יחזור אליכם בהקדם.
            </p>
          </div>

          <form action="#" method="POST" className="form-grid">
            <div className="form-group">
              <label className="form-label">שם מלא *</label>
              <input
                type="text"
                className="form-input"
                placeholder="ישראל ישראלי"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">טלפון נייד *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="050-0000000"
                style={{ textAlign: "right", direction: "ltr" }}
                required
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">כתובת אימייל *</label>
              <input
                type="email"
                className="form-input"
                placeholder="israel@example.com"
                required
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">
                קישור לפרופיל לינקדאין (אופציונלי)
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">קורות חיים *</label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  className="file-upload-input"
                  accept=".pdf,.doc,.docx"
                  required
                />
                <div className="file-upload-content">
                  <Image
                    src="/1.png"
                    alt=""
                    width={60}
                    height={60}
                    style={{ marginBottom: 8 }}
                  />
                  <span
                    style={{ color: "var(--text-pure)", fontWeight: 500 }}
                  >
                    לחצו כאן להעלאת קובץ קורות חיים
                  </span>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-dim)",
                    }}
                  >
                    תמיכה בקבצי PDF, DOCX (עד 5MB)
                  </span>
                </div>
              </div>
            </div>
            <div className="form-group full-width">
              <label className="form-label">כמה מילים עליכם (אופציונלי)</label>
              <textarea
                className="form-textarea"
                placeholder="ספרו לנו למה אתם המתאימים ביותר לתפקיד..."
              />
            </div>
            <div
              className="form-group full-width"
              style={{ marginTop: 20 }}
            >
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: 20, fontSize: "1.2rem" }}
              >
                שליחת מועמדות <Send />
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
