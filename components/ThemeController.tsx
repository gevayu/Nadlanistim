"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ThemeController() {
  const pathname = usePathname();

  useEffect(() => {
    const isLight = pathname.startsWith("/v2") || pathname.startsWith("/v3") || pathname.startsWith("/v4");
    const isV4 = pathname.startsWith("/v4");
    const isV5 = pathname.startsWith("/v5");
    document.body.classList.toggle("v5-page", isV5);
    document.body.classList.toggle("theme-light", isLight);
    document.body.classList.toggle("v4-dark-bg", isV4);
    return () => {
      document.body.classList.remove("theme-light");
      document.body.classList.remove("v4-dark-bg");
    };
  }, [pathname]);

  return null;
}
