// Jobs board listings — one source for /jobs, /jobs-locked and /job.
// `id` is the listing's public serial number: unique, never reused.

export type JobKind = "offer" | "seek";

export type Job = {
  id: number;
  kind: JobKind;
  title: string;
  by: string;
  email: string;
  type: string;
  place: string;
  field: string;
  desc: string;
  date: string; // dd.mm.yyyy
};

export const JOB_KINDS: Record<JobKind, string> = {
  offer: "משרה פתוחה",
  seek: "מחפש/ת עבודה",
};

export const JOBS: Job[] = [
  { id: 1008, kind: "seek", title: "מנהלת שיווק עם 6 שנות ניסיון בנדל״ן", by: "נועה ברגר", email: "noa@nadlanistim.co.il", type: "משרה מלאה", place: "תל אביב", field: "שיווק", desc: "מחפשת תפקיד ניהול שיווק בחברת יזמות או תיווך. ניסיון בהשקות של פרויקטים למגורים.", date: "17.11.2023" },
  { id: 1007, kind: "seek", title: "בוגר שמאות מקרקעין מחפש משרד להתמחות", by: "עומר בן חיים", email: "omer@nadlanistim.co.il", type: "משרה חלקית", place: "ירושלים", field: "שמאות", desc: "סיימתי תואר בשמאות מקרקעין ומחפש משרד שמאות להשלמת ההתמחות.", date: "16.11.2023" },
  { id: 1001, kind: "offer", title: "מנהל/ת פרויקטים בנדל״ן", by: "אבי כהן", email: "avi@nadlanistim.co.il", type: "משרה מלאה", place: "תל אביב", field: "ניהול", desc: "ניהול פרויקטים מורכבים בתחום הנדל״ן, כולל תכנון, ביצוע ובקרת תקציב.", date: "15.11.2023" },
  { id: 1002, kind: "offer", title: "יועץ/ת שיווק דיגיטלי", by: "שרה לוי", email: "sara@nadlanistim.co.il", type: "פרילנס", place: "מרחוק", field: "שיווק", desc: "בניית אסטרטגיות שיווק דיגיטלי וניהול קמפיינים לחברות נדל״ן.", date: "14.11.2023" },
  { id: 1003, kind: "offer", title: "שותף/ה למיזם סטארט-אפ נדל״ן", by: "דוד מזרחי", email: "david@nadlanistim.co.il", type: "שותפות עסקית", place: "תל אביב", field: "טכנולוגיה", desc: "מחפשים שותף טכנולוגי עם ניסיון בפיתוח פלטפורמות דיגיטליות.", date: "13.11.2023" },
  { id: 1004, kind: "offer", title: "מתנדב/ת לפרויקט שיפוץ קהילתי", by: "רחל כהן", email: "rachel@nadlanistim.co.il", type: "התנדבות", place: "ירושלים", field: "הנדסה", desc: "דרושים מתנדבים עם ידע בשיפוצים קלים לעזרה בפרויקט קהילתי.", date: "12.11.2023" },
  { id: 1005, kind: "offer", title: "מתווך/ת נדל״ן למשרד בוטיק", by: "יוסי לוי", email: "yossi@nadlanistim.co.il", type: "משרה חלקית", place: "הרצליה", field: "תיווך", desc: "מתווך/ת עם רישיון וניסיון למשרד תיווך יוקרתי.", date: "11.11.2023" },
  { id: 1006, kind: "offer", title: "שמאי/ת מקרקעין עצמאי/ת", by: "מיכל מזרחי", email: "michal@nadlanistim.co.il", type: "מציעים שירותים", place: "כל הארץ", field: "שמאות", desc: "שמאית מקרקעין מוסמכת מציעה שירותי הערכת שווי לנכסים.", date: "10.11.2023" },
];

export function getJob(id: number): Job | undefined {
  return JOBS.find((j) => j.id === id);
}
