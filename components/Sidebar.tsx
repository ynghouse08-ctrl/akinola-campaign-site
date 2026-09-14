"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/campaign", label: "Campaign" },
  { href: "/dashboard/gpa", label: "GPA / CGPA" },
  { href: "/dashboard/transport", label: "Transport Prices" },
  { href: "/dashboard/profile", label: "Profile" },
];

export default function Sidebar({
  fullName,
  isAdmin,
}: {
  fullName: string | null;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-line bg-panel px-4 py-3 sm:hidden">
        <p className="font-display text-lg text-forest">Akinola</p>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-md border border-line px-3 py-1.5 text-sm"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <aside
        className={`${
          open ? "block" : "hidden"
        } w-full shrink-0 border-r border-line bg-panel px-4 py-6 sm:block sm:w-60 sm:flex sm:flex-col sm:justify-between`}
      >
        <div>
          <div className="hidden px-2 sm:block">
            <p className="font-display text-lg text-forest">Akinola</p>
            <p className="text-xs text-ink/50">for Financial Secretary</p>
          </div>

          <nav className="mt-4 space-y-1 sm:mt-8">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm transition ${
                    active
                      ? "bg-forest text-paper"
                      : "text-ink/70 hover:bg-paper hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {isAdmin && (
            <div className="mt-6 border-t border-line pt-4">
              <p className="px-3 text-xs uppercase tracking-wide text-ink/40">
                Admin
              </p>
              <Link
                href="/admin"
                className="mt-2 block rounded-md bg-gold/20 px-3 py-2 text-sm font-medium text-forest transition hover:bg-gold/30"
              >
                Admin panel
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 px-2 sm:mt-0">
          {fullName && (
            <p className="mb-2 truncate text-xs text-ink/50">{fullName}</p>
          )}
          <button
            onClick={handleLogout}
            className="w-full rounded-md border border-line px-3 py-2 text-left text-sm text-ink/70 transition hover:border-forest hover:text-forest"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
