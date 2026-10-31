import type { Metadata } from "next";
import "./globals.css";
import Background from "@/components/Background";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BentoMouseTracker from "@/components/BentoMouseTracker";
import RevealObserver from "@/components/RevealObserver";
import LayoutGate from "@/components/LayoutGate";
import A11yWidget from "@/components/A11yWidget";
import { A11Y_KEY, applyA11y } from "@/lib/a11y";
import { OG_BASE, SITE_NAME, SITE_URL } from "@/lib/seo";

// Saved accessibility settings go on <html> before the first paint, so a visitor with large text or high
// contrast never sees the page flash at the default size first.
const A11Y_BOOT = `try{(${applyA11y.toString()})(JSON.parse(localStorage.getItem(${JSON.stringify(A11Y_KEY)})||"{}")||{})}catch(e){}`;

const HOME_TITLE = `${SITE_NAME} | הקהילה המקצועית של ענף הנדל״ן בישראל`;
const HOME_DESCRIPTION =
  "קהילת אנשי המקצוע של הנדל״ן בישראל: אירועים ונטוורקינג, מדריך נדלניסטים, לוח דרושים, שיתופי פעולה עסקיים ופודקאסט.";

// The homepage ("/") uses the defaults; every other route sets its own title in its layout (lib/seo.ts).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_TITLE, template: `%s | ${SITE_NAME}` },
  description: HOME_DESCRIPTION,
  // Every page points search engines at its own address on SITE_URL (not vercel.app, not a ?query variant).
  alternates: { canonical: "./" },
  openGraph: { ...OG_BASE, title: HOME_TITLE, description: HOME_DESCRIPTION },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: A11Y_BOOT }} />
      </head>
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
        <A11yWidget />
      </body>
    </html>
  );
}
