"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ThemeController() {
  const pathname = usePathname();

  useEffect(() => {
    const isLight = pathname.startsWith("/v2") || pathname.startsWith("/v3");
    document.body.classList.toggle("theme-light", isLight);
    return () => {
      document.body.classList.remove("theme-light");
    };
  }, [pathname]);

  return null;
}
