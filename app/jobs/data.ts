// Jobs board listings - one source for /jobs, /jobs-locked and /job.
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
  // Only listings from WordPress carry these.
  slug?: string;
  tag?: string; // homepage career card label
  company?: string;
  img?: string; // featured image URL
  reqs?: string[];
  tags?: string[];
};

export const JOB_KINDS: Record<JobKind, string> = {
  offer: "משרה פתוחה",
  seek: "מחפש/ת עבודה",
};

// WordPress "employment" select value -> label shown as "סוג עבודה".
export const JOB_TYPES: Record<string, string> = {
  full: "משרה מלאה",
  part: "משרה חלקית",
  freelance: "פרילנס",
  partnership: "שותפות",
  volunteering: "התנדבות",
  services: "מציעים שירותים",
};
