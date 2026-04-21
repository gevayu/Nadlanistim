import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Facebook, Linkedin, Link as LinkIcon } from "lucide-react";
import { getPost, posts } from "@/lib/data";
import SponsorBanner from "@/components/SponsorBanner";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <main className="article-page">
        <Image
          src="/image_056f1a.png"
          alt=""
          width={1200}
          height={1200}
          className="hero-bg-element"
          aria-hidden
        />
        <Image
          src="/image_0518e6.png"
          alt=""
          width={400}
          height={400}
          className="hero-bg-element-2"
          aria-hidden
        />

        <div className="container">
          <SponsorBanner size="large" style={{ marginBottom: 60 }} />
        </div>

        <div className="container article-header reveal">
          <div
            className="tag"
            style={{
              marginBottom: 20,
              background: "rgba(4, 238, 254, 0.1)",
              borderColor: "rgba(4, 238, 254, 0.2)",
              color: "var(--accent-cyan)",
            }}
          >
            <Image
              src="/1.png"
              alt=""
              width={27}
              height={27}
              className="custom-icon-sm"
              style={{ marginInlineEnd: 8 }}
            />{" "}
            {post.category}
          </div>
          <h1 className="article-title">{post.title}</h1>
          {post.author && (
            <div className="article-meta">
              <div className="author">
                {post.authorImage && (
                  <Image
                    src={post.authorImage}
                    alt={post.author}
                    width={40}
                    height={40}
                  />
                )}
                <span>{post.author}</span>
              </div>
              {post.publishedAt && (
                <>
                  <span>&bull;</span>
                  <span>{post.publishedAt}</span>
                </>
              )}
              {post.readTime && (
                <>
                  <span>&bull;</span>
                  <span>
                    <Image
                      src="/3.png"
                      alt=""
                      width={27}
                      height={27}
                      className="custom-icon-sm"
                      style={{
                        display: "inline-block",
                        verticalAlign: "middle",
                        marginInlineEnd: 4,
                      }}
                    />{" "}
                    {post.readTime}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {post.heroImage && (
          <div
            className="container reveal"
            style={{ transitionDelay: "0.1s" }}
          >
            <div className="article-hero-image">
              <Image
                src={post.heroImage}
                alt={post.heroImageAlt || ""}
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                priority
              />
            </div>
          </div>
        )}

        <div className="container">
          <article
            className="article-content reveal"
            style={{ transitionDelay: "0.2s" }}
          >
            {post.body?.map((block, i) => {
              if (block.type === "p") return <p key={i}>{block.text}</p>;
              if (block.type === "h2") return <h2 key={i}>{block.text}</h2>;
              if (block.type === "h3") return <h3 key={i}>{block.text}</h3>;
              if (block.type === "quote")
                return (
                  <div key={i} className="article-quote">
                    {block.text}
                  </div>
                );
              return null;
            })}

            <div className="article-footer">
              {post.tags && (
                <div
                  style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
                >
                  {post.tags.map((tag) => (
                    <span
                      key={tag.label}
                      className="tag"
                      style={{ background: "transparent" }}
                    >
                      <span
                        className="dot"
                        style={{
                          background: tag.color,
                          boxShadow: `0 0 10px ${tag.color}`,
                        }}
                      />{" "}
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
              <div
                style={{ display: "flex", alignItems: "center", gap: 16 }}
              >
                <span
                  style={{ fontWeight: 500, color: "var(--text-pure)" }}
                >
                  שתפו את המאמר:
                </span>
                <div className="share-buttons">
                  <a href="#" className="share-btn" aria-label="שתף בפייסבוק">
                    <Facebook size={18} />
                  </a>
                  <a
                    href="#"
                    className="share-btn"
                    aria-label="שתף בלינקדאין"
                  >
                    <Linkedin size={18} />
                  </a>
                  <a href="#" className="share-btn" aria-label="העתק קישור">
                    <LinkIcon size={18} />
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      <div className="container">
        <SponsorBanner size="small" />
      </div>

      <section className="related-section">
        <div className="container">
          <h2
            style={{
              fontSize: "2.5rem",
              marginBottom: 40,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
            className="reveal"
          >
            <Image
              src="/2.png"
              alt=""
              width={48}
              height={48}
              className="custom-icon"
            />{" "}
            מאמרים נוספים בנושא
          </h2>

          <div className="related-grid">
            {related.map((r, idx) => (
              <Link
                key={r.slug}
                href={`/posts/${r.slug}`}
                className="bento-card reveal"
                style={{ transitionDelay: `${0.1 * idx}s` }}
              >
                <div className="card-img">
                  <Image
                    src={r.image}
                    alt={r.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <h3>{r.title}</h3>
                <p>{r.excerpt}</p>
                <span className="read-more-link">
                  קראו עוד <ArrowLeft size={18} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
