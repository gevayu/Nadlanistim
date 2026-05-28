"use client";

import { usePathname } from "next/navigation";

export default function LayoutGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/v5")) return null;
  return <>{children}</>;
}
