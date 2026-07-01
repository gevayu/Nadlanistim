"use client";

import { usePathname } from "next/navigation";
import { usesV6Chrome } from "@/lib/site-chrome";

export default function LayoutGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (usesV6Chrome(pathname)) return null;
  return <>{children}</>;
}
