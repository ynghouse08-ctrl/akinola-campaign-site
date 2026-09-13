"use client";

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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col justify-between border-r border-line bg-panel px-4 py-6">
      <div>
        <div className="px-2">
          <p className="font-display text-lg text-forest">Akinola</p>
          <p className="text-xs text-ink/50">for Financial Secretary</p>
        </div>

        <nav className="mt-8 space-y-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
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

      <div className="px-2">
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
  );
}
