"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string | null;
  matric_number: string | null;
  level: string | null;
  faculty: string | null;
  department: string | null;
  phone: string | null;
};

export default function ProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
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
          "full_name, matric_number, level, faculty, department, phone"
        )
        .eq("id", user.id)
        .single();

      setProfile(data);
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
      .update(profile)
      .eq("id", user.id);

    setSaveMsg(error ? error.message : "Profile updated.");
  }

  if (loading) return <p className="text-sm text-ink/50">Loading…</p>;
  if (!profile) return <p className="text-sm text-ink/50">Profile not found.</p>;

  const fields: { key: keyof Profile; label: string; placeholder?: string }[] = [
    { key: "full_name", label: "Full name" },
    { key: "matric_number", label: "Matric number" },
    { key: "level", label: "Level" },
    { key: "faculty", label: "Faculty" },
    { key: "department", label: "Department" },
    { key: "phone", label: "Phone number" },
  ];

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl text-ink">Your profile</h1>
      <p className="mt-2 text-sm text-ink/60">
        Update your academic and contact details.
      </p>

      <div className="mt-6 space-y-4 rounded-lg border border-line bg-panel p-6">
        {fields.map((f) => (
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
