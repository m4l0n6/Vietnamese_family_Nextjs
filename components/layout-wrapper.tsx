"use client";

import type React from "react";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { Toaster } from "@/components/ui/toaster";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <div className="relative flex flex-col min-h-screen">
      {!isDashboard && <SiteHeader />}
      <main className="flex-1">{children}</main>
      {!isDashboard && <SiteFooter />}
      <Toaster />
    </div>
  );
}
