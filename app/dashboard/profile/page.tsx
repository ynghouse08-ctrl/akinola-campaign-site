"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string | null;
  matric_number: string | null;
  jamb_reg_number: string | null;
  level: string | null;
  faculty: string | null;
  department: string | null;
  phone: string | null;
  role: string;
};

type LatestRecord = {
  label: string;
  gpa: number | null;
  cgpa: number | null;
} | null;

export default function ProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [latest, setLatest] = useState<LatestRecord>(null);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select(
          "full_name, matric_number, jamb_reg_number, level, faculty, department, phone, role"
        )
        .eq("id", user.id)
        .single();

      setProfile(data);

      const { data: record } = await supabase
        .from("gpa_records")
        .select("label, gpa, cgpa")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setLatest(record);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof Profile>(key: K, value: string) {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
  }

  async function handleSave() {
    if (!profile) return;
    setSaveMsg(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        matric_number: profile.matric_number,
        jamb_reg_number: profile.jamb_reg_number,
        level: profile.level,
        faculty: profile.faculty,
        department: profile.department,
        phone: profile.phone,
      })
      .eq("id", user.id);

    setSaveMsg(error ? error.message : "Profile updated.");
  }

  if (loading) return <p className="text-sm text-ink/50">Loading…</p>;
  if (!profile) return <p className="text-sm text-ink/50">Profile not found.</p>;

  const initial = (profile.full_name?.trim()?.[0] ?? "U").toUpperCase();

  const summaryFields: { label: string; value: string }[] = [
    { label: "Faculty", value: profile.faculty || "—" },
    { label: "Department", value: profile.department || "—" },
    { label: "Phone Number", value: profile.phone || "—" },
    {
      label: "Matric / JAMB No.",
      value: profile.matric_number || profile.jamb_reg_number || "—",
    },
  ];

  const editFields: { key: keyof Profile; label: string }[] = [
    { key: "full_name", label: "Full name" },
    { key: "matric_number", label: "Matric number" },
    { key: "jamb_reg_number", label: "JAMB reg. number" },
    { key: "level", label: "Level" },
    { key: "faculty", label: "Faculty" },
    { key: "department", label: "Department" },
    { key: "phone", label: "Phone number" },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl text-ink">Your profile</h1>
      <p className="mt-2 text-sm text-ink/60">
        Your matriculation details and academic progress.
      </p>

      {/* Overview card */}
      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-panel">
        <div className="flex items-center gap-4 border-b border-line p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-goldsoft font-display text-2xl text-forest">
            {initial}
          </div>
          <div>
            <h2 className="font-display text-xl text-ink">
              {profile.full_name || "Student"}
            </h2>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className="rounded-full bg-forest/10 px-3 py-0.5 text-xs font-medium text-forest">
                {profile.level || "Level not set"}
              </span>
              <span className="rounded-full bg-line px-3 py-0.5 text-xs font-medium text-ink/60">
                Role: {profile.role}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
          {summaryFields.map((f) => (
            <div key={f.label} className="bg-panel p-4">
              <p className="text-xs text-ink/50">{f.label}</p>
              <p className="mt-1 truncate text-sm font-medium text-ink">
                {f.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-px bg-line border-t border-line">
          <div className="bg-forest p-4 text-paper">
            <p className="text-xs text-paper/70">Latest GPA</p>
            <p className="mt-1 font-display text-2xl">
              {latest?.gpa ?? "—"}
            </p>
          </div>
          <div className="bg-ink p-4 text-paper">
            <p className="text-xs text-paper/70">Latest CGPA</p>
            <p className="mt-1 font-display text-2xl text-gold">
              {latest?.cgpa ?? "—"}
            </p>
          </div>
        </div>
        {latest?.label && (
          <p className="border-t border-line px-4 py-2 text-xs text-ink/40">
            From: {latest.label}
          </p>
        )}
        {!latest && (
          <p className="border-t border-line px-4 py-2 text-xs text-ink/40">
            No GPA/CGPA saved yet — use the calculator to add your first record.
          </p>
        )}
      </div>

      {/* Editable form */}
      <h3 className="mt-8 font-display text-lg text-ink">Edit details</h3>
      <div className="mt-3 space-y-4 rounded-lg border border-line bg-panel p-6">
        {editFields.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-medium text-ink/70">
              {f.label}
            </label>
            <input
              value={profile[f.key] ?? ""}
              onChange={(e) => update(f.key, e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
            />
          </div>
        ))}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            className="rounded-md bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-forest"
          >
            Save changes
          </button>
          {saveMsg && <span className="text-sm text-ink/60">{saveMsg}</span>}
        </div>
      </div>
    </div>
  );
}
