import type { Metadata } from "next";
import "./globals.css";
import Background from "@/components/Background";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BentoMouseTracker from "@/components/BentoMouseTracker";
import RevealObserver from "@/components/RevealObserver";

export const metadata: Metadata = {
  title: "הנדל\"ניסטים | העתיד של הנדל״ן",
  description:
    "קהילת הנדל״ן האקסקלוסיבית של ישראל. מחברים בין הון, חזון וביצוע.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <Background />
        <Header />
        {children}
        <Footer />
        <BentoMouseTracker />
        <RevealObserver />
      </body>
    </html>
  );
}
