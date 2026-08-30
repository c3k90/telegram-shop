"use client";

import { usePathname } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") {
    return <div className="min-h-dvh bg-background px-6 py-6">{children}</div>;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background md:flex-row">
      <AdminNav />
      <div className="flex-1 px-6 py-6">{children}</div>
    </div>
  );
}
