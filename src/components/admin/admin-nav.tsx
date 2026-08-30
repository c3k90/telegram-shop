"use client";

import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  return (
    <aside className="flex w-full flex-col justify-between border-b bg-sidebar px-4 py-4 md:w-56 md:border-b-0 md:border-r">
      <div className="space-y-4">
        <p className="text-sm font-semibold">Shop admin</p>
        <nav className="flex flex-wrap gap-2 md:flex-col">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <form action={logoutAction} className="mt-4">
        <Button type="submit" variant="outline" size="sm">
          Log out
        </Button>
      </form>
    </aside>
  );
}
