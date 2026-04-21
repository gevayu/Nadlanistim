"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

type NewsItem = {
  tag: string;
  tagColor: string;
  author: string;
  title: string;
  description: string;
  linkText: string;
  href: string;
  image: string;
  imageAlt: string;
};

const newsItems: NewsItem[] = [
  {
    tag: "נדלניסטים ברשת",
    tagColor: "var(--accent-green)",
    author: "מאת משה זוכמיר, זוכמיר נדל״ן",
    title: "הזדמנויות מעבר לים: מדריך 2026",
    description:
      "מיוון ועד דובאי: איפה באמת כדאי לשים את הכסף עכשיו? פאנל מומחים מיוחד סוקר את מפת הסיכונים העולמית.",
    linkText: "לצפייה במדריך",
    href: "/posts/overseas-opportunities-2026",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    imageAlt: "השקעות בחול",
  },
  {
    tag: "נדלניסטים ברשת",
    tagColor: "var(--accent-green)",
    author: "מאת רנה אביב, קבוצת אביב יזמות",
    title: "פינוי-בינוי: המכרה של 2026",
    description:
      "מה צריך לדעת לפני שנכנסים לפרויקט התחדשות עירונית? המומחים מסבירים מדוע הטיימינג הנוכחי הוא ההזדמנות הטובה ביותר.",
    linkText: "לקריאת המאמר",
    href: "/posts/urban-renewal-2026",
    image:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=800",
    imageAlt: "התחדשות עירונית",
  },
  {
    tag: "נדלניסטים ברשת",
    tagColor: "var(--accent-green)",
    author: "מאת אייל שמש, שמש הון ונדל״ן",
    title: "נדל״ן לוגיסטי: הענף שכולם מפספסים",
    description:
      "מרכזי הפצה ומחסנים הפכו לנכסים הכי חמים בשוק. למה המשקיע הפרטי עדיין לא שם?",
    linkText: "לקריאת הניתוח",
    href: "/posts/logistics-real-estate",
    image:
      "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800",
    imageAlt: "נדל״ן לוגיסטי",
  },
  {
    tag: "נדלניסטים ברשת",
    tagColor: "var(--accent-green)",
    author: "מאת נועה גולן, גולן אסטייטס",
    title: "שוק היוקרה: כשהמחיר לא עוצר אף אחד",
    description:
      "דירות במחיר שיא, ועדיין רשימת המתנה ארוכה. מה מניע את קוני הנדל״ן היוקרתי ב-2026?",
    linkText: "לצפייה בראיון",
    href: "/posts/luxury-market-2026",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
    imageAlt: "נדל״ן יוקרה",
  },
];

export default function RotatingNewsCard({ delay = "0.1s" }: { delay?: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % newsItems.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <article className="bento-card card-news rotating-news-card reveal" style={{ transitionDelay: delay }}>
      {newsItems.map((item, idx) => (
        <div key={idx} className={`news-slide ${idx === current ? "active" : ""}`}>
          <div className="news-content">
            <div className="tag" style={{ marginBottom: 20, alignSelf: "flex-start" }}>
              <span className="dot" style={{ background: item.tagColor }} />{" "}
              {item.tag}
            </div>
            <h3>{item.title}</h3>
            <p style={{ color: "var(--accent-primary)", fontWeight: 600, fontSize: "0.95rem", marginBottom: 16 }}>
              {item.author}
            </p>
            <p style={{ color: "var(--text-dim)", marginBottom: 30, fontSize: "1.1rem" }}>
              {item.description}
            </p>
            <Link
              href={item.href}
              style={{ color: "var(--text-pure)", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}
            >
              {item.linkText} <ArrowLeft size={18} />
            </Link>
          </div>
          <div className="news-img">
            <Image
              src={item.image}
              alt={item.imageAlt}
              width={800}
              height={600}
              sizes="(max-width: 1200px) 45vw, 30vw"
            />
          </div>
        </div>
      ))}
      <div className="news-slide-dots">
        {newsItems.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`כתבה ${idx + 1}`}
            className={`dot-indicator ${idx === current ? "active" : ""}`}
            onClick={() => setCurrent(idx)}
          />
        ))}
      </div>
    </article>
  );
}
