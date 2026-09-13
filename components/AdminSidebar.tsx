"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/transport", label: "Transport Prices" },
];

export default function AdminSidebar({
  fullName,
}: {
  fullName: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col justify-between border-r border-line bg-ink px-4 py-6">
      <div>
        <div className="px-2">
          <p className="font-display text-lg text-gold">Admin</p>
          <p className="text-xs text-paper/50">Akinola for Fin. Sec.</p>
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
                    ? "bg-gold text-ink"
                    : "text-paper/70 hover:bg-forest hover:text-paper"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-paper/10 pt-4">
          <Link
            href="/dashboard"
            className="block rounded-md px-3 py-2 text-sm text-paper/70 transition hover:bg-forest hover:text-paper"
          >
            View as student →
          </Link>
        </div>
      </div>

      <div className="px-2">
        {fullName && (
          <p className="mb-2 truncate text-xs text-paper/50">{fullName}</p>
        )}
        <button
          onClick={handleLogout}
          className="w-full rounded-md border border-paper/20 px-3 py-2 text-left text-sm text-paper/70 transition hover:border-gold hover:text-gold"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
