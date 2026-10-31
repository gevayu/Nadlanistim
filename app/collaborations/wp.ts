// Collaborations board from WordPress (nad_collab + its ACF group).
import { wpDate, wpLines, wpQuery } from "../../lib/wp";
import { BOARD_TABS, type Collab, type CollabTab } from "./data";

type Terms = { nodes: { name: string }[] };

/** ACF select labels per field, as WordPress sets them: { stage: { idea: "רעיון", ... }, ... } */
type Choices = Record<string, Record<string, string>>;

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

// collabChoices: the labels of the select fields (mu-plugin nadlanistim-collab-choices.php).
const QUERY = `{ collabChoices
  collabs(first: 100, where: { orderby: { field: DATE, order: DESC } }) { nodes {
  slug title date
  featuredImage { node { sourceUrl(size: LARGE) } }
  regions { nodes { name } }
  collabTypes { nodes { name } }
  collabFields {
    looking boardTab invest stage type place by byRole publishedDate
    description lookingList tags email phone
  }
} } }`;

// A select value -> its WordPress label. A value WordPress has no label for shows nothing.
const label = (choices: Choices, field: string, value: string[] | null | undefined) =>
  choices[field]?.[value?.[0] ?? ""] ?? "";

const toCollab = (choices: Choices) => ({ slug, title, date, featuredImage, regions, collabTypes, collabFields: f }: WpCollab): Collab => ({
  slug,
  title,
  looking: label(choices, "looking", f?.looking),
  // The "סוג" term wins; the ACF text field covers a post nobody has tagged yet.
  type: collabTypes.nodes.map((t) => t.name).join(", ") || f?.type || "",
  place: f?.place ?? "",
  region: regions.nodes[0]?.name,
  invest: label(choices, "invest", f?.invest),
  stage: label(choices, "stage", f?.stage),
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
  const data = await wpQuery<{ collabChoices: string | null; collabs: { nodes: WpCollab[] } }>(QUERY);
  return data.collabs.nodes.map(toCollab(JSON.parse(data.collabChoices || "{}")));
}

/** The board tabs, named in WordPress. A tab WordPress has no name for is left off. */
export async function getCollabTabs(): Promise<CollabTab[]> {
  const { collabChoices } = await wpQuery<{ collabChoices: string | null }>("{ collabChoices }");
  const names: Record<string, string> = JSON.parse(collabChoices || "{}").board_tab ?? {};
  return BOARD_TABS.filter((key) => names[key]).map((key) => ({ key, label: names[key] }));
}
