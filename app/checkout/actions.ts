"use server";

import { redirect } from "next/navigation";
import { startCheckout } from "../../lib/store";

export type CheckoutState = {
  error?: string;
  /** What the buyer typed, so a failed submit doesn't wipe the form. */
  values?: Record<"first_name" | "last_name" | "email" | "phone", string>;
};

export async function checkout(_prev: CheckoutState, form: FormData): Promise<CheckoutState> {
  const get = (k: string) => String(form.get(k) ?? "");
  const values = { first_name: get("first_name"), last_name: get("last_name"), email: get("email"), phone: get("phone") };

  const result = await startCheckout({
    productId: Number(get("product")),
    quantity: Number(get("quantity")),
    firstName: values.first_name,
    lastName: values.last_name,
    email: values.email,
    phone: values.phone,
  });
  if ("error" in result) return { error: result.error, values };
  // iCount's hosted payment page.
  redirect(result.redirectUrl);
}
