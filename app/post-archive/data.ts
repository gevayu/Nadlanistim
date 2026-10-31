// "מרכז הידע" article types. All content comes from WordPress (post-archive/wp.ts).

/** One block of an article body, in the order the editor laid them out. */
export type Block =
  | { kind: "p" | "quote"; text: string }
  | { kind: "h2"; text: string; accent?: string }
  | { kind: "list"; items: string[] }
  | { kind: "img"; src: string; caption: string };

export type Author = { name: string; avatar: string; role: string; bio: string };

export type Article = {
  slug: string;
  title: string;
  titleMain: string; // the headline is titleMain + titleAccent, the accent highlighted
  titleAccent: string;
  img: string; // featured image URL, "" when none
  imgSrcSet?: string; // WordPress's resized copies of it ("url 768w, ...")
  type: string; // מדריך / הסבר / מחקר / Case Study
  cats: string[];
  tags: string[];
  minutes: number;
  excerpt: string;
  author: Author;
  date: string; // "יוני 2026"
  published?: string; // ISO date from WordPress, for search engines
  featured: boolean;
  body: Block[];
  html?: string; // WordPress post content, used only when the article has no body blocks
};
