"use client";

import SiteShell from "../v6/SiteShell";
import { eventHref, heDate, metaLine, type EventItem } from "../events/data";
import "./event-recap.css";
import { sendRecap } from "../forms/actions";
import { FormError, Honeypot, useFormSend } from "../forms/FormParts";
import SaveButton from "../v6/SaveButton";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PlayIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>);
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><path d="M12 3v12m0 0l4-4m-4 4l-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// Every block below renders only when WordPress has data for it.
export default function RecapView({ ev, next }: { ev: EventItem; next?: EventItem }) {
  const deck = ev.downloads[0];
  const recap = useFormSend(sendRecap);
  return (
    <SiteShell crumb={ev.title}>
      {/* Hero */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="rc-hero" data-reveal>
            <span className="rc-badge">✓ האירוע הסתיים</span>
            <h1>{ev.title} - <em>תודה שהייתם איתנו</em></h1>
            <SaveButton title={ev.title} />
            {ev.desc && <p>{ev.desc}</p>}
            {ev.video && <a href={ev.video} className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>צפו בהקלטה המלאה</span><ArrowIcon /></a>}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {ev.recapGallery.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="rc-section-title" data-reveal>רגעים מהאירוע</h2>
            <div className="rc-gallery">
              {ev.recapGallery.map((g) => (
                <figure key={g} data-reveal><img src={g} alt="" /></figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Takeaways */}
      {ev.takeaways.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="rc-section-title" data-reveal>מה למדנו? התובנות המרכזיות</h2>
            <div className="rc-num">
              {ev.takeaways.map((it, i) => (
                <div key={it.t} className="rc-num__item v6-glass" data-reveal>
                  <div className="rc-num__n">{i + 1}</div>
                  <div className="rc-num__t"><b>{it.t}</b>{it.d && <p>{it.d}</p>}</div>
                </div>
              ))}
            </div>
            {deck && (
              <div className="rc-center-cta" data-reveal>
                <a href={deck.url} className="v6-btn v6-btn--primary"><span>הורידו את מצגת האירוע (PDF)</span><DownloadIcon /></a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Highlights video */}
      {ev.video && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="rc-section-title" data-reveal>לא הצלחתם להגיע? הנה רגעי השיא</h2>
            <div className="rc-video v6-glass" data-reveal>
              {ev.videoThumb && <img src={ev.videoThumb} alt="" />}
              <a href={ev.video} className="rc-video__play" aria-label="נגן וידאו"><PlayIcon /></a>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {ev.recapTestimonials.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="rc-section-title" data-reveal>מה אמרו המשתתפים?</h2>
            <div className="rc-testi">
              {ev.recapTestimonials.map((t) => (
                <article key={t.q} className="rc-testi__card v6-glass" data-reveal>
                  <div className="rc-testi__q">״{t.q}״</div>
                  <div className="rc-testi__by">
                    {t.img && <div className="rc-testi__av" style={{ backgroundImage: `url(${t.img})` }} />}
                    <div>
                      <div className="rc-testi__name">{t.name}</div>
                      {t.role && <div className="rc-testi__role">{t.role}</div>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Downloads */}
      {ev.downloads.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="rc-section-title" data-reveal>לקחת אתכם הביתה</h2>
            <div className="rc-downloads">
              {ev.downloads.map((d) => (
                <a key={d.name} href={d.url} className="rc-dl v6-glass" data-reveal><DownloadIcon />{d.name}</a>
              ))}
            </div>
            {recap.state.ok ? (
              <div className="pg-sent" data-reveal>שלחנו את החומרים למייל שלכם.</div>
            ) : (
              <form className="rc-email" data-reveal onSubmit={recap.onSubmit}>
                <Honeypot />
                <input type="hidden" name="event" value={ev.slug} />
                <input type="email" name="email" required placeholder="כתובת אימייל" aria-label="כתובת אימייל" />
                <button type="submit" className="v6-btn v6-btn--primary" disabled={recap.pending}>{recap.pending ? "שולחים…" : "שלחו לי את החומרים"}</button>
              </form>
            )}
            <FormError error={recap.state.error} />
          </div>
        </section>
      )}

      {/* Blue band */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="rc-band" data-reveal>
            <h2>נהנתם? הנה מה שאפשר לעשות עכשיו</h2>
            <div className="rc-band__btns">
              {next && <a href={eventHref(next)} className="v6-btn v6-btn--primary v6-btn--lg">שמרו מקום לאירוע הבא</a>}
              <a href="/join" className="v6-btn v6-btn--glass v6-btn--lg">הצטרפו לקהילה</a>
            </div>
          </div>
        </div>
      </section>

      {/* Next event */}
      {next && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="rc-section-title" data-reveal>▶▶ האירוע הבא שלנו:</h2>
            <div className="rc-next v6-glass" data-reveal>
              {next.img && <div className="rc-next__img"><img src={next.img} alt="" /></div>}
              <div className="rc-next__body">
                <div className="rc-next__date">{metaLine(heDate(next.date), next.place)}</div>
                <h3>{next.title}</h3>
                <a href={eventHref(next)} className="v6-btn v6-btn--primary"><span>שמרו לי מקום</span><ArrowIcon /></a>
              </div>
            </div>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
