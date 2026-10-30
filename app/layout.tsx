import type { Metadata } from "next";
import "./globals.css";
import Background from "@/components/Background";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BentoMouseTracker from "@/components/BentoMouseTracker";
import RevealObserver from "@/components/RevealObserver";
import LayoutGate from "@/components/LayoutGate";
import { OG_BASE, SITE_NAME, SITE_URL } from "@/lib/seo";

const HOME_TITLE = `${SITE_NAME} | הקהילה המקצועית של ענף הנדל״ן בישראל`;
const HOME_DESCRIPTION =
  "קהילת אנשי המקצוע של הנדל״ן בישראל: אירועים ונטוורקינג, מדריך נדלניסטים, לוח דרושים, שיתופי פעולה עסקיים ופודקאסט.";

// The homepage ("/") uses the defaults; every other route sets its own title in its layout (lib/seo.ts).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_TITLE, template: `%s | ${SITE_NAME}` },
  description: HOME_DESCRIPTION,
  openGraph: { ...OG_BASE, title: HOME_TITLE, description: HOME_DESCRIPTION },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <LayoutGate>
          <Background />
        </LayoutGate>
        <Header />
        {children}
        <LayoutGate>
          <Footer />
          <BentoMouseTracker />
        </LayoutGate>
        <RevealObserver />
      </body>
    </html>
  );
}
