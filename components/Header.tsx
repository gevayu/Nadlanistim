"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [hideLogo, setHideLogo] = useState(isHome);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isHome) {
      setHideLogo(false);
      return;
    }
    const heroLogo = document.querySelector<HTMLElement>(".hero-logo-side");
    if (!heroLogo) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setHideLogo(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(heroLogo);
    return () => observer.disconnect();
  }, [isHome, pathname]);

  const classes = [
    "site-header",
    scrolled ? "scrolled" : "",
    hideLogo ? "hide-logo" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const activeSection = pathname.startsWith("/posts")
    ? "magazine"
    : pathname.startsWith("/jobs")
      ? "jobs"
      : "";

  return (
    <header className={classes} id="header">
      <div className="container nav-container">
        <Link href="/" className="logo">
          <Image
            src="/logo-full.png"
            alt="לוגו הנדלניסטים"
            width={260}
            height={65}
            priority
          />
        </Link>

        <nav className="nav-links">
          <a href="#">חזון</a>
          <a href="#" className={activeSection === "magazine" ? "active" : ""}>
            מגזין
          </a>
          <a href="#">כנסים</a>
          <a href="#" className={activeSection === "jobs" ? "active" : ""}>
            משרות
          </a>
        </nav>

        <div className="nav-actions">
          <button className="btn btn-glass">התחברות</button>
          <button className="btn btn-primary">הצטרפות</button>
        </div>
      </div>
    </header>
  );
}
