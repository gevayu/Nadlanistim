// Collaborations board from WordPress (nad_collab + its ACF group).
import { wpDate, wpLines, wpQuery } from "../../lib/wp";
import { COLLAB_INVEST, COLLAB_LOOKING, COLLAB_STAGES, type Collab } from "./data";

type Terms = { nodes: { name: string }[] };

type WpCollab = {
  slug: string;
  title: string;
  date: string;
  featuredImage: { node: { sourceUrl: string } } | null;
  regions: Terms;
  collabTypes: Terms;
  collabFields: {
    looking: string[] | null;
    boardTab: string[] | null;
    invest: string[] | null;
    stage: string[] | null;
    type: string | null;
    place: string | null;
    by: string | null;
    byRole: string | null;
    publishedDate: string | null;
    description: string | null;
    lookingList: string | null;
    tags: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

const QUERY = `{ collabs(first: 100, where: { orderby: { field: DATE, order: DESC } }) { nodes {
  slug title date
  featuredImage { node { sourceUrl(size: LARGE) } }
  regions { nodes { name } }
  collabTypes { nodes { name } }
  collabFields {
    looking boardTab invest stage type place by byRole publishedDate
    description lookingList tags email phone
  }
} } }`;

const toCollab = ({ slug, title, date, featuredImage, regions, collabTypes, collabFields: f }: WpCollab): Collab => ({
  slug,
  title,
  looking: COLLAB_LOOKING[f?.looking?.[0] ?? ""] ?? "",
  // The ACF text field wins; the taxonomy term is the fallback.
  type: f?.type || collabTypes.nodes[0]?.name || "",
  place: f?.place ?? "",
  region: regions.nodes[0]?.name,
  invest: COLLAB_INVEST[f?.invest?.[0] ?? ""] ?? "",
  stage: COLLAB_STAGES[f?.stage?.[0] ?? ""] ?? "",
  tab: f?.boardTab?.[0],
  by: f?.by ?? "",
  byRole: f?.byRole ?? "",
  date: wpDate(f?.publishedDate || date),
  img: featuredImage?.node.sourceUrl ?? "",
  description: wpLines(f?.description),
  lookingList: wpLines(f?.lookingList),
  tags: wpLines(f?.tags),
  email: f?.email ?? "",
  phone: f?.phone ?? "",
});

/** Every collaboration post (all tabs), newest first. */
export async function getCollabs(): Promise<Collab[]> {
  const data = await wpQuery<{ collabs: { nodes: WpCollab[] } }>(QUERY);
  return data.collabs.nodes.map(toCollab);
}
