"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Detail = {
  id: string;
  full_name: string | null;
  email: string;
  matric_number: string | null;
  jamb_reg_number: string | null;
  level: string | null;
  faculty: string | null;
  department: string | null;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at: string | null;
};

type GpaRecord = {
  id: string;
  label: string;
  gpa: number | null;
  cgpa: number | null;
  created_at: string;
};

export default function AdminStudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [student, setStudent] = useState<Detail | null>(null);
  const [records, setRecords] = useState<GpaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: dir } = await supabase.rpc("admin_user_directory");
      const found = (dir as Detail[] | null)?.find((s) => s.id === id) ?? null;
      setStudent(found);

      const { data: gpa } = await supabase
        .from("gpa_records")
        .select("id, label, gpa, cgpa, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false });
      setRecords(gpa ?? []);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function setStatus(status: string) {
    setBusy(true);
    setError(null);
    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", id);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStudent((s) => (s ? { ...s, status } : s));
  }

  async function toggleRole() {
    if (!student) return;
    setBusy(true);
    setError(null);
    const newRole = student.role === "instructor" ? "student" : "instructor";
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", id);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStudent((s) => (s ? { ...s, role: newRole } : s));
  }

  async function deleteAccount() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(json.error || "Could not delete this account.");
      return;
    }
    router.push("/admin/students");
  }

  if (loading) return <p className="text-sm text-ink/50">Loading…</p>;
  if (!student) return <p className="text-sm text-ink/50">Student not found.</p>;

  const fields: { label: string; value: string }[] = [
    { label: "Email", value: student.email },
    { label: "Matric number", value: student.matric_number || "—" },
    { label: "JAMB reg. number", value: student.jamb_reg_number || "—" },
    { label: "Level", value: student.level || "—" },
    { label: "Faculty", value: student.faculty || "—" },
    { label: "Department", value: student.department || "—" },
    { label: "Phone", value: student.phone || "—" },
    {
      label: "Registered",
      value: new Date(student.created_at).toLocaleDateString(),
    },
    {
      label: "Last login",
      value: student.last_sign_in_at
        ? new Date(student.last_sign_in_at).toLocaleString()
        : "Never",
    },
  ];

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => router.push("/admin/students")}
        className="text-sm text-ink/50 hover:text-forest"
      >
        ← Back to students
      </button>

      <h1 className="mt-3 font-display text-3xl text-ink">
        {student.full_name || "Student"}
      </h1>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line">
        {fields.map((f) => (
          <div key={f.label} className="bg-panel p-4">
            <p className="text-xs text-ink/50">{f.label}</p>
            <p className="mt-1 text-sm font-medium text-ink">{f.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-line bg-panel p-6">
        <h2 className="font-display text-lg text-forest">Account controls</h2>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {["active", "unverified", "suspended", "banned"].map((s) => (
            <button
              key={s}
              disabled={busy || student.status === s}
              onClick={() => setStatus(s)}
              className={`rounded-md border px-3 py-1.5 capitalize disabled:opacity-40 ${
                student.status === s
                  ? "border-forest bg-forest text-paper"
                  : "border-line hover:border-forest"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <button
            disabled={busy}
            onClick={toggleRole}
            className="rounded-md border border-line px-3 py-1.5 hover:border-forest disabled:opacity-40"
          >
            {student.role === "instructor"
              ? "Remove instructor role"
              : "Make instructor"}
          </button>

          {confirmDelete ? (
            <>
              <button
                disabled={busy}
                onClick={deleteAccount}
                className="rounded-md bg-red-600 px-3 py-1.5 text-paper hover:bg-red-700 disabled:opacity-40"
              >
                Confirm delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-md border border-line px-3 py-1.5"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
              className="rounded-md border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-40"
            >
              Delete account
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg text-ink">GPA / CGPA history</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-line">
          {records.length === 0 ? (
            <p className="px-4 py-4 text-sm text-ink/50">No records saved.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-paper text-left text-ink/60">
                <tr>
                  <th className="px-4 py-2 font-medium">Semester</th>
                  <th className="px-4 py-2 font-medium">GPA</th>
                  <th className="px-4 py-2 font-medium">CGPA</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-line">
                    <td className="px-4 py-2">{r.label}</td>
                    <td className="px-4 py-2">{r.gpa ?? "—"}</td>
                    <td className="px-4 py-2">{r.cgpa ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
