const headlines = [
  "מגדל יוקרה חדש יוקם בלב תל אביב — השקעה של 1.2 מיליארד שקל",
  "קרן ריט ישראלית גייסה 600 מיליון שקל להרחבת תיק הנכסים",
  "מחירי הדיור בגוש דן עלו 14% ברבעון האחרון",
  "פרויקט ענק בנתניה: 3,200 יחידות דיור ומסחר בשכונה חדשה",
  "עסקת נדל״ן מסחרי בתל אביב נסגרת ב-450 מיליון שקל — שיא חדש",
  "ביקוש לנדל״ן לוגיסטי בצפון הארץ מזנק ב-40% בשנה האחרונה",
  "השקעה ישראלית בנדל״ן בוורשה: רכישת מרכז עסקים ב-280 מיליון אירו",
  "בנק ישראל: שוק המשכנתאות שובר שיא היסטורי ב-2026",
];

export default function NewsTicker() {
  const text = headlines.join("   ·   ");

  return (
    <div className="news-ticker">
      <span className="ticker-label">חדשות נדל״ן</span>
      <div className="ticker-track-wrapper">
        <div className="ticker-track">
          <span>{text}</span>
          <span aria-hidden>{text}</span>
        </div>
      </div>
    </div>
  );
}
