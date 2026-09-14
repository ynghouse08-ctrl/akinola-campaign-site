import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/config";

export default async function DashboardOverview() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, level, matric_number")
    .eq("id", user!.id)
    .single();

  const { data: latestRecord } = await supabase
    .from("gpa_records")
    .select("label, gpa, cgpa")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { count: studentCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div>
      <div className="rounded-lg bg-forest px-8 py-10 text-paper">
        <p className="text-sm text-goldsoft">{SITE.name}</p>
        <h1 className="mt-2 font-display text-3xl">Welcome back, {firstName}</h1>
        <p className="mt-2 max-w-xl text-sm text-paper/80">{SITE.tagline}</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-panel p-5">
          <p className="text-xs text-ink/50">Your latest CGPA</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {latestRecord?.cgpa ?? "—"}
          </p>
          <p className="mt-1 text-xs text-ink/50">
            {latestRecord?.label ?? "No records saved yet"}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-5">
          <p className="text-xs text-ink/50">Your level</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {profile?.level ?? "—"}
          </p>
          <p className="mt-1 text-xs text-ink/50">
            {profile?.matric_number ?? "No matric number set"}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-5">
          <p className="text-xs text-ink/50">Students on this platform</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {studentCount ?? "—"}
          </p>
          <p className="mt-1 text-xs text-ink/50">and growing</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/gpa"
          className="rounded-lg border border-line bg-panel p-6 transition hover:border-forest"
        >
          <h3 className="font-display text-lg text-forest">
            GPA / CGPA calculator
          </h3>
          <p className="mt-2 text-sm text-ink/70">
            Work out this semester&apos;s GPA or your cumulative CGPA, and
            save it to your history.
          </p>
        </Link>
        <Link
          href="/dashboard/transport"
          className="rounded-lg border border-line bg-panel p-6 transition hover:border-forest"
        >
          <h3 className="font-display text-lg text-forest">
            Transport prices
          </h3>
          <p className="mt-2 text-sm text-ink/70">
            Search current fares from Ado-Ekiti to major destinations.
          </p>
        </Link>
      </div>
    </div>
  );
}
