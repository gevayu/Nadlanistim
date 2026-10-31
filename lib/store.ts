// WooCommerce on the headless WordPress backend (public Store API, no keys). Server-side only.
// Prices and stock must be live, so nothing here is cached.
import "server-only";

const WP_STORE_URL = process.env.WP_STORE_URL ?? "https://nadlanistim-cms.bold-move.co.il";
const STORE_API = `${WP_STORE_URL}/wp-json/wc/store/v1`;

const PAYMENT_METHOD = "wc_gateway_icount-wc_icount_gateway";
const MAX_QUANTITY = 10;

export type Product = {
  id: number;
  name: string;
  sku: string;
  /** Unit price in shekels. */
  price: number;
  image?: string;
  /** Short description as plain text. */
  note: string;
  /** Description, one item per line, as plain text. */
  features: string[];
  /** Billing period, the product's "תקופת חיוב" attribute term ("חודש" / "שנה"); empty when not set. */
  period: string;
  /** Tagged `featured` in WooCommerce. */
  featured: boolean;
  soldIndividually: boolean;
  /** Purchasable and in stock. */
  purchasable: boolean;
};

export type OrderSummary = {
  number: string;
  status: string;
  paid: boolean;
  total: number;
  first_name: string;
  email: string;
  items: { name: string; qty: number; total: number }[];
  /** Membership orders only: the buyer's join application. null for anything else (a conference ticket). */
  membership?: "ok" | "pending" | "blocked" | "none" | null;
};

export type CheckoutInput = {
  productId: number;
  quantity: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type StoreProduct = {
  id: number;
  name: string;
  sku: string;
  short_description: string;
  description: string;
  prices: { price: string; currency_minor_unit: number };
  images: { src: string }[];
  tags: { slug: string }[];
  attributes: { taxonomy: string | null; terms: { name: string }[] }[];
  sold_individually: boolean;
  is_purchasable: boolean;
  is_in_stock: boolean;
};

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  ndash: "-", mdash: "-", hellip: "…", lsquo: "'", rsquo: "'", ldquo: '"', rdquo: '"',
};

/**
 * WooCommerce HTML -> plain text: tags out, entities decoded, en/em dashes to "-"
 * (WordPress texturizes " - " into "&#8211;"; the site uses plain hyphens only).
 */
export function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) =>
      e[0] !== "#" ? ENTITIES[e.toLowerCase()] ?? m
        : String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1))))
    .replace(/[\u2013\u2014]/g, "-")
    .trim();
}

const toProduct = (p: StoreProduct): Product => ({
  id: p.id,
  name: plainText(p.name),
  sku: p.sku,
  price: Number(p.prices.price) / 10 ** p.prices.currency_minor_unit,
  image: p.images[0]?.src,
  note: plainText(p.short_description),
  features: p.description.split(/<br\s*\/?>|<\/p>|\n/i).map(plainText).filter(Boolean),
  period: plainText(p.attributes.find((a) => a.taxonomy === "pa_billing_period")?.terms[0]?.name ?? ""),
  featured: p.tags.some((t) => t.slug === "featured"),
  soldIndividually: p.sold_individually,
  purchasable: p.is_purchasable && p.is_in_stock,
});

/** null when the product does not exist. */
export async function getProduct(id: number): Promise<Product | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  const res = await fetch(`${STORE_API}/products/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`WooCommerce product ${id}: HTTP ${res.status}`);
  return toProduct(await res.json());
}

/** Membership plans, cheapest first. */
export async function getMembershipPlans(): Promise<Product[]> {
  const res = await fetch(`${STORE_API}/products?category=membership&orderby=price&order=asc`, { cache: "no-store" });
  if (!res.ok) throw new Error(`WooCommerce membership plans: HTTP ${res.status}`);
  return ((await res.json()) as StoreProduct[]).map(toProduct);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Reads the Store API's `{ code, message }` error body. */
async function apiError(res: Response): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.message ? plainText(String(body.message)) : `שגיאה ${res.status} מהחנות`;
}

/**
 * Fresh cart -> add the product -> create the order with the iCount gateway.
 * On success returns iCount's hosted payment page; the browser goes there next.
 */
export async function startCheckout(input: CheckoutInput): Promise<{ redirectUrl: string } | { error: string }> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  if (!firstName || !lastName || !email || !phone) return { error: "יש למלא את כל השדות." };
  if (!EMAIL.test(email)) return { error: "כתובת האימייל לא תקינה." };

  const product = await getProduct(input.productId);
  if (!product?.purchasable) return { error: "המוצר לא זמין לרכישה כרגע." };
  const max = product.soldIndividually ? 1 : MAX_QUANTITY;
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > max) return { error: "כמות לא תקינה." };

  // A cart session is a Cart-Token + Nonce pair, issued by the first cart read.
  const cart = await fetch(`${STORE_API}/cart`, { cache: "no-store" });
  const token = cart.headers.get("Cart-Token");
  const nonce = cart.headers.get("Nonce");
  if (!cart.ok || !token || !nonce) return { error: "לא הצלחנו לפתוח הזמנה. נסו שוב." };
  const headers = { "Content-Type": "application/json", "Cart-Token": token, Nonce: nonce };

  const added = await fetch(`${STORE_API}/cart/add-item`, {
    method: "POST", headers, cache: "no-store",
    body: JSON.stringify({ id: product.id, quantity: input.quantity }),
  });
  if (!added.ok) return { error: await apiError(added) };

  const res = await fetch(`${STORE_API}/checkout`, {
    method: "POST", headers, cache: "no-store",
    body: JSON.stringify({
      billing_address: {
        first_name: firstName, last_name: lastName, email, phone,
        country: "IL", address_1: "", city: "", postcode: "", state: "",
      },
      payment_method: PAYMENT_METHOD,
    }),
  });
  if (!res.ok) return { error: await apiError(res) };

  const order = await res.json();
  const redirectUrl: string | undefined = order?.payment_result?.redirect_url;
  if (order?.payment_result?.payment_status === "failure" || !redirectUrl) {
    console.error("WooCommerce checkout without a payment page:", JSON.stringify(order));
    return { error: "לא הצלחנו להגיע לעמוד התשלום. נסו שוב או צרו איתנו קשר." };
  }
  return { redirectUrl };
}

/** null when the order or key is wrong. */
export async function getOrderSummary(order: string, key: string): Promise<OrderSummary | null> {
  const qs = new URLSearchParams({ order, key });
  const res = await fetch(`${WP_STORE_URL}/wp-json/nadlanistim/v1/order-summary?${qs}`, { cache: "no-store" });
  if (!res.ok) return null;
  const s = (await res.json()) as OrderSummary;
  return { ...s, items: s.items.map((i) => ({ ...i, name: plainText(i.name) })) };
}
