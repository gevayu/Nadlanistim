import { notFound } from "next/navigation";
import SiteShell from "../../v6/SiteShell";
import { getJobById } from "../../jobs/wp";

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
  </svg>
);

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const job = await getJobById(Number((await params).id));
  if (!job) notFound();
  const paragraphs = job.desc.split(/\n+/).filter(Boolean);

  return (
    <SiteShell crumb={job.title}>

      <section className="v6-section">
        <div className="v6-container">
          <article className="pg-panel v6-glass" data-reveal>
            <div className="pg-panel__head">
              <div className="pg-panel__title">
                <h1>{job.title}</h1>
                <div className="pg-panel__by">פורסם על ידי <b>{job.by}</b></div>
                <div className="pg-panel__id">מס׳ משרה {job.id}</div>
              </div>
              {job.img && (
                <div className="pg-panel__logo">
                  <img src={job.img} alt="" />
                </div>
              )}
            </div>

            <div className="pg-meta">
              <div className="pg-meta__row"><b>סוג עבודה:</b> {job.type}</div>
              <div className="pg-meta__row"><b>מיקום:</b> {job.place}</div>
              <div className="pg-meta__row"><b>תאריך פרסום:</b> {job.date}</div>
            </div>

            <div className="pg-block">
              <h2>תיאור המשרה</h2>
              {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>

            {!!job.reqs?.length && (
              <div className="pg-block">
                <h2>דרישות עיקריות</h2>
                <ul className="pg-bullets">
                  {job.reqs.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </div>
            )}

            {!!job.tags?.length && (
              <div className="pg-block">
                <h2>תגיות</h2>
                <div className="pg-tags">
                  {job.tags.map((t) => <span key={t} className="pg-tag">{t}</span>)}
                </div>
              </div>
            )}

            <div className="pg-divider" />
            <div className="pg-actions">
              <a
                href={`mailto:${job.email}?subject=${encodeURIComponent(`פנייה למשרה מס׳ ${job.id}: ${job.title}`)}`}
                className="pg-iconbtn"
                aria-label={`שליחת הודעה ל${job.by}`}
                title={`שליחת הודעה ל${job.by}`}
              >
                <MailIcon />
              </a>
              <a href="/jobs" className="v6-btn v6-btn--glass">חזרה ללוח הדרושים</a>
            </div>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
