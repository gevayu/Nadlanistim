// Events from WordPress (nad_event + its eventFields ACF group).
import { wpLines, wpQuery } from "../../lib/wp";
import { featuredEvent, pickEvent, type EventItem, type FeatureIcon } from "./data";

// "YYYY-MM-DD" in Israel, comparable with the ACF event date.
const israelToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });

type Img = { node: { sourceUrl: string } } | null;
type Gallery = { nodes: { sourceUrl: string }[] } | null;

type WpEvent = {
  slug: string;
  title: string;
  featuredImage: Img;
  eventTypes: { nodes: { name: string }[] } | null;
  eventFields: {
    eventDate: string | null;
    timeLabel: string | null;
    place: string | null;
    description: string | null;
    agenda: string | null;
    ctaUrl: string | null;
    isAccent: boolean | null;
    isPast: boolean | null;
    price: string | null;
    audience: string | null;
    features: string | null;
    speakerName: string | null;
    speakerRole: string | null;
    speakerPhoto: Img;
    speakerBio: string | null;
    speakerQuote: string | null;
    speakerLink: string | null;
    testimonials: string | null;
    faq: string | null;
    dressCode: string | null;
    entry: string | null;
    vibe: string | null;
    timeline: string | null;
    lineup: string | null;
    lineupPhotos: Gallery;
    partyGallery: Gallery;
    partyQuotes: string | null;
    partyFaq: string | null;
    recapGallery: Gallery;
    takeaways: string | null;
    videoUrl: string | null;
    videoThumb: Img;
    recapTestimonials: string | null;
    recapAvatars: Gallery;
    downloads: string | null;
  } | null;
};

const QUERY = `{ events(first: 100) { nodes {
  slug title
  featuredImage { node { sourceUrl(size: LARGE) } }
  eventTypes { nodes { name } }
  eventFields {
    eventDate timeLabel place description agenda ctaUrl isAccent isPast price audience features
    speakerName speakerRole speakerBio speakerQuote speakerLink
    speakerPhoto { node { sourceUrl(size: MEDIUM) } }
    testimonials faq dressCode entry vibe timeline lineup partyQuotes partyFaq takeaways videoUrl recapTestimonials downloads
    lineupPhotos { nodes { sourceUrl(size: MEDIUM) } }
    partyGallery { nodes { sourceUrl(size: MEDIUM_LARGE) } }
    recapGallery { nodes { sourceUrl(size: MEDIUM_LARGE) } }
    videoThumb { node { sourceUrl(size: LARGE) } }
    recapAvatars { nodes { sourceUrl(size: THUMBNAIL) } }
  }
} } }`;

// "מה מחכה לכם" lines are "emoji | title | text"; the site shows white line icons, not the emoji.
const EMOJI_ICON: Record<string, FeatureIcon> = { "✨": "sparkles", "🎯": "target", "🤝": "deal", "🎁": "gift", "🧀": "food", "🍕": "food" };

/** "a | b | c" lines -> [["a", "b", "c"], ...] */
const cols = (s: string | null | undefined) => wpLines(s).map((l) => l.split("|").map((p) => p.trim()));
const urls = (g: Gallery) => g?.nodes.map((n) => n.sourceUrl) ?? [];
// Editors type "#" as a placeholder link; that is no link at all.
const link = (u: string | null | undefined) => (u && u !== "#" ? u : "");

const toEvent = ({ slug, title, featuredImage, eventTypes, eventFields: f }: WpEvent): EventItem => {
  const lineupPhotos = urls(f?.lineupPhotos ?? null);
  const avatars = urls(f?.recapAvatars ?? null);
  return {
    slug,
    title,
    types: eventTypes?.nodes.map((t) => t.name) ?? [],
    img: featuredImage?.node.sourceUrl ?? "",
    date: f?.eventDate?.slice(0, 10) ?? "",
    time: f?.timeLabel ?? "",
    place: f?.place ?? "",
    desc: f?.description ?? "",
    cta: link(f?.ctaUrl),
    accent: !!f?.isAccent,
    // Past when WordPress says so, or once the event day is over (Israel time), so an editor never has to flip it.
    past: !!f?.isPast || (!!f?.eventDate && f.eventDate.slice(0, 10) < israelToday()),
    price: f?.price ?? "",
    audience: f?.audience ?? "",
    agenda: cols(f?.agenda).map(([time = "", what = ""]) => ({ time, what })),
    features: cols(f?.features).map(([emoji = "", t = "", d = ""]) => ({ ic: EMOJI_ICON[emoji.replace("\uFE0F", "")] ?? "sparkles", t, d })),
    speaker: f?.speakerName
      ? {
          name: f.speakerName,
          role: f.speakerRole ?? "",
          photo: f.speakerPhoto?.node.sourceUrl ?? "",
          bio: f.speakerBio ?? "",
          quote: f.speakerQuote ?? "",
          link: link(f.speakerLink),
        }
      : null,
    testimonials: cols(f?.testimonials).map(([q = "", by = ""]) => ({ q, by })),
    faq: wpLines(f?.faq),
    dressCode: f?.dressCode ?? "",
    entry: f?.entry ?? "",
    vibe: wpLines(f?.vibe),
    timeline: cols(f?.timeline).map(([time = "", t = "", s = ""]) => ({ time, t, s })),
    // Photos are a separate gallery in the same order as the lineup lines.
    lineup: cols(f?.lineup).map(([name = "", role = ""], i) => ({ name, role, img: lineupPhotos[i] ?? "" })),
    partyGallery: urls(f?.partyGallery ?? null),
    partyQuotes: cols(f?.partyQuotes).map(([q = "", by = ""]) => ({ q, by })),
    partyFaq: wpLines(f?.partyFaq),
    recapGallery: urls(f?.recapGallery ?? null),
    takeaways: cols(f?.takeaways).map(([t = "", d = ""]) => ({ t, d })),
    video: link(f?.videoUrl),
    videoThumb: f?.videoThumb?.node.sourceUrl ?? "",
    // Avatars are a separate gallery in the same order as the testimonial lines.
    recapTestimonials: cols(f?.recapTestimonials).map(([q = "", name = "", role = ""], i) => ({ q, name, role, img: avatars[i] ?? "" })),
    // A download without a real URL can't be downloaded, so it isn't listed.
    downloads: cols(f?.downloads).map(([name = "", url = ""]) => ({ name, url: link(url) })).filter((d) => d.url),
  };
};

export async function getEvents(): Promise<EventItem[]> {
  const data = await wpQuery<{ events: { nodes: WpEvent[] } }>(QUERY);
  return data.events.nodes.map(toEvent);
}

/** What /event, /event-party and /event-recap render: the `?e=<slug>` event, else the route's default. */
export async function getEvent(route: "/event" | "/event-party" | "/event-recap", slug?: string): Promise<EventItem | undefined> {
  return pickEvent(await getEvents(), route, slug);
}

/** The upcoming event the site promotes (events page, "next event" on the recap). */
export async function getFeaturedEvent(): Promise<EventItem | undefined> {
  return featuredEvent(await getEvents());
}
