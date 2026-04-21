"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Slide = {
  image: string;
  imageAlt: string;
  tagLabel: string;
  tagDotColor: string;
  title: string;
  description: string;
  ctaLabel: string;
};

const slides: Slide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1600",
    imageAlt: "מגמות בנדלן",
    tagLabel: "דו״ח שוק 2026",
    tagDotColor: "#fff",
    title: "האם הפריפריה תנצח את אזורי הביקוש?",
    description:
      "ניתוח נתונים בלעדי לחברי הקהילה מתוך אלפי עסקאות אחרונות. הטרנדים שיגדירו את השנה הקרובה.",
    ctaLabel: "לקריאת הדו״ח",
  },
  {
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600",
    imageAlt: "התחדשות עירונית",
    tagLabel: "התחדשות עירונית",
    tagDotColor: "var(--accent-cyan)",
    title: "התחדשות עירונית 2.0: העיר משנה פנים",
    description:
      "כל הכלים החדשים והשינויים הרגולטוריים שישפיעו על הפרויקט הבא שלכם. מדריך מעשי ליזמים.",
    ctaLabel: "גלו עוד",
  },
  {
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1600",
    imageAlt: "בינה מלאכותית",
    tagLabel: "טכנולוגיה",
    tagDotColor: "var(--accent-purple)",
    title: "בינה מלאכותית בשירות הנדל״ניסט",
    description:
      "כיצד כלי AI משנים את הדרך בה אנחנו מוצאים עסקאות, מנתחים סיכונים וסוגרים חוזים ב-2026.",
    ctaLabel: "המדריך המלא",
  },
];

export default function FeaturedSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <article className="bento-card card-featured reveal">
      <div className="slider-wrapper">
        {slides.map((slide, idx) => (
          <div
            key={slide.title}
            className={`slider-item ${idx === current ? "active" : ""}`}
          >
            <div className="img-bg">
              <Image
                src={slide.image}
                alt={slide.imageAlt}
                fill
                sizes="(max-width: 1200px) 100vw, 66vw"
                priority={idx === 0}
              />
            </div>
            <div className="featured-content">
              <div
                className="tag"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderColor: "transparent",
                }}
              >
                <span
                  className="dot"
                  style={{
                    background: slide.tagDotColor,
                    boxShadow: "none",
                  }}
                />{" "}
                {slide.tagLabel}
              </div>
              <h2>{slide.title}</h2>
              <p
                style={{
                  fontSize: "1.1rem",
                  maxWidth: 600,
                  color: "#d4d4d8",
                  marginBottom: 30,
                }}
              >
                {slide.description}
              </p>
              <button
                className="btn btn-glass"
                style={{ borderRadius: 12, padding: "12px 24px" }}
              >
                {slide.ctaLabel}
              </button>
            </div>
          </div>
        ))}
        <div className="slider-dots">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`מעבר לשקופית ${idx + 1}`}
              className={`dot-indicator ${idx === current ? "active" : ""}`}
              onClick={() => setCurrent(idx)}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
