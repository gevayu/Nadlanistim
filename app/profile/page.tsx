import { redirect } from "next/navigation";
import { getSession } from "../../lib/auth";

// "My profile": the signed-in member's published nadlanist page. No published profile yet: the edit form.
export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/profile");
  const own = session.nadlanist;
  redirect(own?.status === "publish" && own.slug ? `/nadlanist/${own.slug}` : "/my-account");
}
