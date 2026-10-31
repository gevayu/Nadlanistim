import SiteShell from "../v6/SiteShell";
import "./post.css";
import type { Article, Block } from "../post-archive/data";
import ShareButtons from "./ShareButtons";
import SaveButton from "../v6/SaveButton";
import LazyImg from "../v6/LazyImg";

const BlockView = ({ b }: { b: Block }) => {
  switch (b.kind) {
    case "p": return <p>{b.text}</p>;
    case "h2": return <h2>{b.text}{b.accent && <> <em>{b.accent}</em></>}</h2>;
    case "list": return <ul>{b.items.map((li) => <li key={li}>{li}</li>)}</ul>;
    case "quote": return <blockquote className="post-quote">{b.text}</blockquote>;
    case "img": return (
      <figure className="post-figure">
        <img loading="lazy" decoding="async" src={b.src} alt="" />
        {b.caption && <figcaption>{b.caption}</figcaption>}
      </figure>
    );
  }
};

/** A single "מרכז הידע" article (the /post template), plus up to three more from `all` to read next. Empty fields render nothing. */
export default function ArticleView({ a, all }: { a: Article; all: Article[] }) {
  const cat = a.cats[0];
  const related = all.filter((r) => r.slug !== a.slug).slice(0, 3);
  const meta = [a.author.name && <b key="by">{a.author.name}</b>, <span key="date">{a.date}</span>, <span key="read">{a.minutes} דק׳ קריאה</span>]
    .filter(Boolean)
    .flatMap((el, i) => (i ? [<span key={`sep${i}`} className="post-meta__sep">·</span>, el] : [el]));
  return (
    <SiteShell crumb={a.title}>
      {/* Hero */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="post-hero" data-reveal>
            {cat && <a href={`/post-archive?cat=${encodeURIComponent(cat)}`} className="post-cat">{cat}</a>}
            <h1>{a.titleMain}{a.titleAccent && <> <em>{a.titleAccent}</em></>}</h1>
            <SaveButton title={a.title} />
            <div className="post-meta">
              {a.author.avatar && <span className="post-meta__av" style={{ backgroundImage: `url(${a.author.avatar})` }} />}
              {meta}
            </div>
          </div>

          {a.img && (
            <figure className="post-cover" data-reveal>
              {/* The cover is the largest thing on the page: fetched first, and a phone takes the copy its screen needs. */}
              <img fetchPriority="high" src={a.img} srcSet={a.imgSrcSet} sizes="(max-width: 960px) 100vw, 960px" alt="" />
            </figure>
          )}

          {/* Body: editor blocks; the post content field is trusted HTML from our own backend */}
          {a.html
            ? <article className="post-body" data-reveal dangerouslySetInnerHTML={{ __html: a.html }} />
            : a.body.length > 0 && <article className="post-body" data-reveal>{a.body.map((b, i) => <BlockView key={i} b={b} />)}</article>}

          {/* Tags */}
          {a.tags.length > 0 && (
            <div className="post-tags" data-reveal>
              {a.tags.map((t) => <a key={t} href={`/post-archive?tag=${encodeURIComponent(t)}`} className="pg-tag">{t}</a>)}
            </div>
          )}

          {/* Author */}
          {a.author.name && (
            <div className="post-author v6-glass" data-reveal>
              {a.author.avatar && <div className="post-author__av" style={{ backgroundImage: `url(${a.author.avatar})` }} />}
              <div>
                <div className="post-author__name">{a.author.name}</div>
                {a.author.role && <div className="post-author__role">{a.author.role}</div>}
                {a.author.bio && <p>{a.author.bio}</p>}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="post-share" data-reveal>
            <a href="/post-archive" className="v6-btn v6-btn--glass">חזרה למרכז הידע</a>
            <ShareButtons />
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="pg-subhead" data-reveal>עוד ממרכז הידע</h2>
            <div className="pg-grid">
              {related.map((r) => (
                <a key={r.slug} href={`/article/${r.slug}`} className="pg-imgcard v6-glass" data-reveal>
                  {r.img && <figure className="pg-imgcard__img"><LazyImg src={r.img} alt="" /></figure>}
                  <div className="pg-imgcard__body">
                    {r.cats[0] && <div className="pg-imgcard__meta">{r.cats[0]}</div>}
                    <h3>{r.title}</h3>
                    <span className="v6-btn v6-btn--glass" style={{ padding: "10px 18px", fontSize: 13.5 }}>קרא עוד</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
