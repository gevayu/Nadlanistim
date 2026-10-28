"use client";

import { useEffect, useState } from "react";
import SiteShell from "../v6/SiteShell";
import OpenToWorkRing from "../v6/OpenToWorkRing";
import { FIELDS, PLACES, type Nadlanist } from "../nadlanistim/data";
import { CURRENT_MEMBER, saveEdits, useNadlanistim } from "../nadlanistim/member";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <path d="M12 15V3m0 0l4 4m-4-4L8 7M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Shrinks an uploaded photo to a 400px square JPEG so it fits in browser storage.
function toSquareJpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 400;
      canvas.getContext("2d")!.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 400, 400);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Keeps a stored value selectable even if it isn't in the standard list (e.g. "הרצליה").
const withCurrent = (list: string[], value: string) => (value && !list.includes(value) ? [value, ...list] : list);

export default function MyAccount({ people }: { people: Nadlanist[] }) {
  const me = useNadlanistim(people).find((n) => n.slug === CURRENT_MEMBER)!;
  const [form, setForm] = useState<Nadlanist>(me);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  // useNadlanistim applies saved edits after mount; pick them up once they arrive.
  useEffect(() => setForm(me), [me]);

  const set = <K extends keyof Nadlanist>(key: K, value: Nadlanist[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setStatus("idle");
  };

  // bio[0] is the intro next to the photo; the rest is "קצת עליי", one paragraph per blank-line block.
  const about = form.bio.slice(1).join("\n\n");
  const setAbout = (text: string) => set("bio", [form.bio[0] ?? "", ...text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)]);

  const onPhoto = async (file?: File) => {
    if (!file) return;
    try {
      set("photo", await toSquareJpeg(file));
    } catch {
      setStatus("error");
    }
  };

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    const { slug, ...edits } = form; // eslint-disable-line @typescript-eslint/no-unused-vars
    try {
      saveEdits(edits);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>החשבון <em>שלי</em></h1>
            <p>הפרטים כאן מופיעים בכרטיס שלך במדריך ״הכר את הנדלניסט״ ובעמוד הפרופיל שלך.</p>
          </div>

          <article className="pg-panel v6-glass" style={{ maxWidth: 760 }} data-reveal>
            <form className="pg-form" onSubmit={onSave}>
              <div className="ma-photo">
                <div className="pg-person__av ma-photo__av">
                  <img src={form.photo} alt={form.name} />
                  {form.openToWork && <OpenToWorkRing />}
                </div>
                <div className="v6-field" style={{ flex: 1 }}>
                  <label htmlFor="ma-img">תמונת פרופיל</label>
                  <label className="pg-upload" htmlFor="ma-img"><UploadIcon /> לחצו להעלאת תמונה חדשה</label>
                  <input id="ma-img" type="file" accept="image/*" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
                </div>
              </div>

              <label className="ma-otw" htmlFor="ma-otw">
                <input id="ma-otw" type="checkbox" checked={!!form.openToWork} onChange={(e) => set("openToWork", e.target.checked)} />
                <span>
                  <b>Open to work · אני מחפש/ת עבודה</b>
                  <small>מסגרת ירוקה עם #OPENTOWORK תופיע סביב התמונה שלך במדריך ובפרופיל.</small>
                </span>
              </label>

              <div className="pg-formgrid">
                <div className="v6-field">
                  <label htmlFor="ma-name">שם מלא</label>
                  <input id="ma-name" type="text" required value={form.name} onChange={(e) => set("name", e.target.value)} />
                </div>
                <div className="v6-field">
                  <label htmlFor="ma-role">תפקיד / כותרת</label>
                  <input id="ma-role" type="text" required value={form.role} onChange={(e) => set("role", e.target.value)} />
                </div>
                <div className="v6-field">
                  <label htmlFor="ma-field">תחום עיסוק</label>
                  <select id="ma-field" required value={form.field} onChange={(e) => set("field", e.target.value)}>
                    {withCurrent(FIELDS, form.field).map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="v6-field">
                  <label htmlFor="ma-place">מיקום</label>
                  <select id="ma-place" required value={form.place} onChange={(e) => set("place", e.target.value)}>
                    {withCurrent(PLACES, form.place).map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div className="v6-field">
                <label htmlFor="ma-quote">ציטוט אישי (מוצג בכרטיס)</label>
                <input id="ma-quote" type="text" required value={form.quote} onChange={(e) => set("quote", e.target.value)} />
              </div>
              <div className="v6-field">
                <label htmlFor="ma-intro">פסקת פתיחה (ליד התמונה בפרופיל)</label>
                <textarea id="ma-intro" required value={form.bio[0] ?? ""} onChange={(e) => set("bio", [e.target.value, ...form.bio.slice(1)])} />
              </div>
              <div className="v6-field">
                <label htmlFor="ma-about">קצת עליי (שורה ריקה בין פסקאות)</label>
                <textarea id="ma-about" value={about} onChange={(e) => setAbout(e.target.value)} />
              </div>

              <div className="pg-formgrid">
                <div className="v6-field">
                  <label htmlFor="ma-email">אימייל</label>
                  <input id="ma-email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div className="v6-field">
                  <label htmlFor="ma-phone">טלפון (לא מוצג באתר)</label>
                  <input id="ma-phone" type="tel" value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="050-0000000" />
                </div>
                <div className="v6-field">
                  <label htmlFor="ma-linkedin">לינקדאין</label>
                  <input id="ma-linkedin" type="url" value={form.linkedin ?? ""} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/…" />
                </div>
                <div className="v6-field">
                  <label htmlFor="ma-instagram">אינסטגרם</label>
                  <input id="ma-instagram" type="url" value={form.instagram ?? ""} onChange={(e) => set("instagram", e.target.value)} placeholder="https://instagram.com/…" />
                </div>
              </div>

              {status === "saved" && (
                <div className="pg-sent">
                  נשמר. ✓ <a href={`/nadlanist/${CURRENT_MEMBER}`}>לפרופיל שלך</a> · <a href="/nadlanistim">למדריך</a>
                </div>
              )}
              {status === "error" && <div className="pg-sent ma-error">לא הצלחנו לשמור. נסו שוב או העלו תמונה קטנה יותר.</div>}

              <button type="submit" className="v6-btn v6-btn--primary v6-btn--lg v6-btn--block" data-magnetic="">
                <span>שמירת הפרטים</span>
                <ArrowIcon />
              </button>
            </form>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
