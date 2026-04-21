export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  category: string;
  categoryDotColor: string;
  author?: string;
  authorImage?: string;
  publishedAt?: string;
  readTime?: string;
  heroImage?: string;
  heroImageAlt?: string;
  body?: Array<{ type: "p" | "h2" | "h3" | "quote"; text: string }>;
  tags?: Array<{ label: string; color: string }>;
};

export type Job = {
  slug: string;
  title: string;
  subtitle: string;
  heroImage: string;
  heroImageAlt: string;
  company: string;
  employment: string;
  location: string;
  publishedAt: string;
  contactEmail: string;
  contactPhone: string;
  description: string[];
  requirements: string[];
  offer: string;
  tags: Array<{ label: string; color: string }>;
};

export const posts: Post[] = [
  {
    slug: "overseas-opportunities-2026",
    title: "הזדמנויות מעבר לים: המדריך המלא למשקיע הישראלי ב-2026",
    excerpt:
      "מיוון ועד דובאי: איפה באמת כדאי לשים את הכסף עכשיו? פאנל מומחים מיוחד סוקר את מפת הסיכונים העולמית.",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    imageAlt: "השקעות בחול",
    category: "השקעות נדל״ן",
    categoryDotColor: "var(--accent-cyan)",
    author: "רז אברהם, צוות המגזין",
    authorImage:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100",
    publishedAt: "12 במרץ, 2026",
    readTime: "6 דקות קריאה",
    heroImage:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1600",
    heroImageAlt: "וילה יוקרתית מעבר לים",
    body: [
      {
        type: "p",
        text: 'מיוון, דרך דובאי ועד פורטוגל – שוק הנדל״ן העולמי מציע כיום מגוון עצום של אפשרויות עבור המשקיע הישראלי. בעוד השוק המקומי ממשיך להתמודד עם אתגרי ריבית, היצע ורגולציה נוקשה, נדמה כי מעבר לים חוקי המשחק שונים לחלוטין. אך האם באמת קל יותר לעשות כסף בחו"ל? יצאנו לבדוק.',
      },
      {
        type: "p",
        text: 'שנת 2026 מביאה איתה מגמות חדשות במפת ההשקעות הגלובלית. המשקיעים הישראלים כבר לא מחפשים רק את התשואה המיידית אלא גם ביטחון גיאופוליטי, יציבות מטבע, ומדינות המציעות תנאי מס נוחים או אפילו מסלולים לאזרחות וזהב. על פי הנתונים האחרונים שנאספו בקהילת "הנדלניסטים", היקף הכספים שהועברו להשקעות נדל"ן באירופה ובאמירויות צמח ב-34% ביחס לשנה שעברה.',
      },
      { type: "h2", text: "יוון וקפריסין: היעדים החמים" },
      {
        type: "p",
        text: 'אגן הים התיכון ממשיך להיות מגנט לישראלים, ולא רק בגלל המרחק הקצר. ביוון, תוכנית "ויזת הזהב" אמנם עברה שינויים ורף הכניסה עלה באזורי הביקוש כמו מרכז אתונה, אך משקיעים זריזים מוצאים הזדמנויות מעולות באיים ובפריפריה (כמו סלוניקי או פלופונסוס) שם מחירי הכניסה עדיין נמוכים משמעותית מישראל, והתשואה השנתית נעה סביב 6%-8% משכירות קצרת טווח.',
      },
      {
        type: "p",
        text: "בקפריסין השכנה, ההתפתחות המואצת של לימסול ולרנקה מושכת לא רק משקיעים בודדים, אלא גם חברות יזמיות ישראליות שמעתיקות פעילות שלמה לאי, נהנות ממס חברות נמוך ומאוכלוסיית הייטק הולכת וגדלה שמחפשת דיור איכותי.",
      },
      {
        type: "quote",
        text: "ניהול סיכונים הוא שם המשחק כשמשקיעים בחו״ל. תשואה דו-ספרתית מובטחת על הנייר היא לעיתים תמרור אזהרה. חובה להכיר את הרגולציה המקומית, את המיסוי, ובעיקר – למצוא חברת ניהול אמינה שמהווה את העיניים והאוזניים שלכם בשטח.",
      },
      { type: "h2", text: "דובאי: האם הבועה כאן כדי להישאר?" },
      {
        type: "p",
        text: 'דובאי ממשיכה לשבור שיאים ב-2026. שוק היוקרה פורח, וויזות העבודה למשקיעים ארוכי טווח הפכו את האמירות ליעד אטרקטיבי מתמיד. עם זאת, המומחים בקהילה שלנו מציינים כי השוק בדובאי תנודתי, וחובה להבין באילו שכונות (Communities) נכון להשקיע. אזורים מבוססים כמו ה"מרינה" או "דאונטאון" מציעים יציבות, בעוד פרויקטים חדשים על הנייר (Off-Plan) באזורים מתפתחים מציעים פוטנציאל השבחת הון גבוה, אך עם סיכון גבוה יותר לעיכובים מסירה.',
      },
      { type: "h2", text: "מה צופן העתיד?" },
      {
        type: "p",
        text: 'התחזית ל-2026 מעידה על התבגרות של המשקיע הישראלי. נראה פחות עסקאות "על עיוור" ויותר בדיקות נאותות מעמיקות, סיורי שטח, וחבירה לקבוצות רכישה מאורגנות המנוהלות על ידי גופים משפטיים מוכרים. השקעה בחו"ל היא כלי מעולה לפיזור סיכונים, כל עוד היא נעשית בצורה מושכלת ומקצועית.',
      },
    ],
    tags: [
      { label: "השקעות", color: "var(--accent-cyan)" },
      { label: "אירופה", color: "var(--accent-purple)" },
      { label: "דובאי", color: "var(--accent-green)" },
      { label: "מדריך", color: "var(--accent-cyan)" },
    ],
  },
  {
    slug: "interest-rate-impact",
    title: "השפעת הריבית על שוק הנדל״ן",
    excerpt:
      "בצל שינויי הריבית האחרונים של בנק ישראל, יזמים רבים מחשבים מסלול מחדש.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
    imageAlt: "אווירת נדלן",
    category: "שוק",
    categoryDotColor: "var(--accent-green)",
  },
  {
    slug: "construction-trends-2026",
    title: "מגמות בנייה לקראת 2026",
    excerpt:
      "התייקרות חומרי הגלם מול טכנולוגיות בנייה חדשות שמנסות לשבור את השוק.",
    image:
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&q=80&w=600",
    imageAlt: "מגמות בנייה",
    category: "בנייה",
    categoryDotColor: "var(--accent-cyan)",
  },
  {
    slug: "periphery-investments",
    title: "מהפכת ההשקעות בפריפריה",
    excerpt: "האם התשואה בצפון ובדרום באמת מפצה על הסיכון התכנוני?",
    image:
      "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=600",
    imageAlt: "השקעות בפריפריה",
    category: "שוק",
    categoryDotColor: "var(--accent-purple)",
  },
  {
    slug: "alternative-digital-real-estate",
    title: "השקעות אלטרנטיביות: נדל״ן דיגיטלי?",
    excerpt: "האם עולם הנדל״ן עומד להשתנות בעקבות הדיגיטציה של נכסים?",
    image:
      "https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=600",
    imageAlt: "נדל״ן דיגיטלי",
    category: "טכנולוגיה",
    categoryDotColor: "var(--accent-cyan)",
  },
];

export const jobs: Job[] = [
  {
    slug: "bd-project-manager",
    title: "מנהל/ת פיתוח עסקי ופרויקטים בנדל״ן",
    subtitle:
      "הזדמנות נדירה להשתלב בשדרת הניהול של אחת מקבוצות היזמות המובילות בישראל ולהוביל פרויקטים רחבי היקף.",
    heroImage:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=800",
    heroImageAlt: "אילוסטרציה של אישה מנהלת פרויקטים באמצע עשייה",
    company: "פסגות נדל״ן יזמות בע״מ",
    employment: "משרה מלאה (אופציה להיברידי)",
    location: "מגדלי חג'ג', תל אביב",
    publishedAt: "12 במרץ, 2026",
    contactEmail: "jobs@psagot-nadlan.co.il",
    contactPhone: "03-555-1234",
    description: [
      'קבוצת היזמות המובילה "פסגות נדל״ן" מחפשת מנהל/ת פיתוח עסקי ופרויקטים תותח/ית להצטרפות לצוות המטה בתל אביב. התפקיד כולל איתור, ייזום וניהול של פרויקטים למגורים ומסחר, בדגש על תחום ההתחדשות העירונית (פינוי בינוי ותמ״א 38).',
      "אנו מחפשים אדם עם חזון, יכולות ניהול משא ומתן ברמה הגבוהה ביותר, והיכרות מעמיקה עם הרגולציה והרשויות המקומיות. במסגרת התפקיד תוביל/י את הפרויקט משלב איתור הקרקע ועד לקבלת היתרי בנייה ותחילת ביצוע.",
    ],
    requirements: [
      "תואר אקדמי רלוונטי (כלכלה, מנהל עסקים, משפטים, הנדסה או שמאות מקרקעין) – חובה.",
      "ניסיון של 3 שנים לפחות בייזום וניהול פרויקטים בנדל״ן / פיתוח עסקי בחברה יזמית.",
      "ניסיון מוכח והיכרות מעמיקה עם תחום ההתחדשות העירונית – יתרון משמעותי.",
      "יכולת ניתוח דוחות אפס והבנה פיננסית גבוהה.",
      "כישורי משא ומתן מעולים ויכולת עבודה מול מגוון ממשקים (בעלי קרקע, עורכי דין, רשויות, אדריכלים).",
      "ייצוגיות, כריזמה, ורעב להצלחה ולסגירת עסקאות.",
    ],
    offer:
      "תנאים מעולים למתאימים/ות, כולל שכר בסיס גבוה + בונוסים מתגמלים על סגירת עסקאות ועמידה באבני דרך. רכב צמוד, סביבת עבודה צעירה, דינמית וטכנולוגית במשרדים מפנקים במרכז תל אביב, ואפשרויות קידום נרחבות בתוך הקבוצה.",
    tags: [
      { label: "פיתוח עסקי", color: "var(--accent-cyan)" },
      { label: "ניהול פרויקטים", color: "var(--accent-purple)" },
      { label: "התחדשות עירונית", color: "var(--accent-green)" },
      { label: "משרת ניהול", color: "var(--accent-cyan)" },
      { label: "בכירים", color: "var(--accent-purple)" },
    ],
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

export function getJob(slug: string) {
  return jobs.find((j) => j.slug === slug);
}
