"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Nadlanist = {
  name: string;
  role: string;
  company: string;
  quote: string;
  image: string;
};

const nadlanistim: Nadlanist[] = [
  {
    name: "רז אברהם",
    role: "שותף מנהל",
    company: "קבוצת אברהם נדל״ן",
    quote:
      "נדל״ן אמיתי לא נקנה בדאטה — הוא נקנה בשיחות. אנשים מביאים עסקאות, לא אלגוריתמים.",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "יעל כהן",
    role: "מייסדת ומנכ״לית",
    company: "Cohen Ventures",
    quote:
      "בכל שנה שוק הנדל״ן בישראל מייצר שחקנים חדשים. מי שלא נמצא בחדר הנכון — מפספס את העסקאות שבאמת משנות.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "דני לוי",
    role: "שותף מייסד",
    company: "לוי נכסים בינלאומי",
    quote:
      "העתיד של הנדל״ן הישראלי נמצא מחוץ לגבולות המדינה. השאלה היא רק עם מי אתם הולכים לשם.",
    image:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "מיכל שרון",
    role: "ראש תחום ייזום",
    company: "שרון פיתוח ויזמות",
    quote:
      "רגולציה משתנה כל רבעון, וההבדל בין פרויקט מצליח לכישלון זה הידע שמקבלים מהקולגות — לא מהייעוץ.",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
  },
];

export default function MeetNadlanist() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % nadlanistim.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <article className="bento-card card-featured card-meet-nadlanist reveal">
      {nadlanistim.map((n, idx) => (
        <div
          key={n.name}
          className={`meet-slide ${idx === current ? "active" : ""}`}
        >
          <div className="meet-content">
            <div
              className="tag"
              style={{ marginBottom: 24, alignSelf: "flex-start" }}
            >
              <span
                className="dot"
                style={{ background: "var(--accent-purple)" }}
              />{" "}
              הכר את הנדל״ניסט
            </div>
            <blockquote className="meet-quote">&ldquo;{n.quote}&rdquo;</blockquote>
            <div className="meet-identity">
              <div className="meet-name">{n.name}</div>
              <div className="meet-role">
                {n.role} · {n.company}
              </div>
            </div>
          </div>
          <div className="meet-photo">
            <Image
              src={n.image}
              alt={n.name}
              fill
              sizes="(max-width: 1200px) 45vw, 30vw"
              style={{ objectFit: "cover", objectPosition: "top" }}
              priority={idx === 0}
            />
          </div>
        </div>
      ))}
      <div className="meet-dots">
        {nadlanistim.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`הנדל״ניסט ${idx + 1}`}
            className={`dot-indicator ${idx === current ? "active" : ""}`}
            onClick={() => setCurrent(idx)}
          />
        ))}
      </div>
    </article>
  );
}
