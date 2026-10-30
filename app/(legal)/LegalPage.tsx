// Legal pages (/terms, /privacy, /accessibility): a core WordPress page each, fetched by its URI.
// Editors change the wording in WordPress; this file only lays it out.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMeta } from "@/lib/seo";
import { wpQuery } from "@/lib/wp";
import SiteShell from "../v6/SiteShell";
import "./legal.css";

type WpPage = { title: string; content: string | null } | null;

// Slugs are fixed strings from the route files, never user input.
const getPage = async (slug: string) =>
  (await wpQuery<{ page: WpPage }>(`{ page(id: "/${slug}/", idType: URI) { title content } }`)).page;

export async function legalMeta(slug: string): Promise<Metadata> {
  const page = await getPage(slug);
  return page ? pageMeta(page.title, page.content ?? "") : {};
}

export default async function LegalPage({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page?.content) notFound();
  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>{page.title}</h1>
          </div>
          <article className="pg-panel v6-glass lg-body" dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      </section>
    </SiteShell>
  );
}
