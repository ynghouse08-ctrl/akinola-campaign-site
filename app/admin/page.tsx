import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOverview() {
  const supabase = createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, matric_number, role, blocked");

  const total = profiles?.length ?? 0;
  const admins = profiles?.filter((p) => p.role === "admin").length ?? 0;
  const blocked = profiles?.filter((p) => p.blocked).length ?? 0;

  // Flag duplicate matric numbers — a simple, transparent signal for
  // possible fake/bot signups, rather than anything automatic/hidden.
  const matricCounts = new Map<string, number>();
  profiles?.forEach((p) => {
    if (!p.matric_number) return;
    matricCounts.set(
      p.matric_number,
      (matricCounts.get(p.matric_number) ?? 0) + 1
    );
  });
  const duplicateMatrics = [...matricCounts.entries()].filter(
    ([, count]) => count > 1
  );

  const { count: routeCount } = await supabase
    .from("transport_routes")
    .select("id", { count: "exact", head: true });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Admin overview</h1>
      <p className="mt-2 text-sm text-ink/60">
        A snapshot of the platform right now.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-line bg-panel p-5">
          <p className="text-xs text-ink/50">Total students</p>
          <p className="mt-2 font-display text-2xl text-ink">{total}</p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-5">
          <p className="text-xs text-ink/50">Admins</p>
          <p className="mt-2 font-display text-2xl text-ink">{admins}</p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-5">
          <p className="text-xs text-ink/50">Blocked accounts</p>
          <p className="mt-2 font-display text-2xl text-ink">{blocked}</p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-5">
          <p className="text-xs text-ink/50">Transport routes</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {routeCount ?? 0}
          </p>
        </div>
      </div>

      {duplicateMatrics.length > 0 && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5">
          <p className="font-medium text-red-700">
            {duplicateMatrics.length} matric number
            {duplicateMatrics.length > 1 ? "s" : ""} used by more than one
            account
          </p>
          <p className="mt-1 text-sm text-red-700/80">
            This can mean a genuine mistake, or someone creating duplicate
            accounts. Check them in the Students page.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-red-700">
            {duplicateMatrics.map(([matric, count]) => (
              <li key={matric}>
                {matric} — {count} accounts
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/students"
          className="rounded-lg border border-line bg-panel p-6 transition hover:border-forest"
        >
          <h3 className="font-display text-lg text-forest">Students</h3>
          <p className="mt-2 text-sm text-ink/70">
            View every registered student, promote/demote admins, block or
            delete accounts.
          </p>
        </Link>
        <Link
          href="/admin/transport"
          className="rounded-lg border border-line bg-panel p-6 transition hover:border-forest"
        >
          <h3 className="font-display text-lg text-forest">
            Transport prices
          </h3>
          <p className="mt-2 text-sm text-ink/70">
            Add, edit, or remove routes and fares shown to students.
          </p>
        </Link>
      </div>
    </div>
  );
}
