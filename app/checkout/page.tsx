import { notFound } from "next/navigation";
import SiteShell from "../v6/SiteShell";
import { getProduct } from "../../lib/store";
import CheckoutForm from "./CheckoutForm";
import "./checkout.css";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const product = await getProduct(Number((await searchParams).product));
  if (!product?.purchasable) notFound();

  return (
    <SiteShell crumb={product.name}>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>תשלום</h1>
          </div>
          <CheckoutForm product={product} />
        </div>
      </section>
    </SiteShell>
  );
}
