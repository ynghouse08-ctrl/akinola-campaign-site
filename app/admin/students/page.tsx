"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Student = {
  id: string;
  full_name: string | null;
  matric_number: string | null;
  jamb_reg_number: string | null;
  level: string | null;
  faculty: string | null;
  department: string | null;
  phone: string | null;
  role: string;
  blocked: boolean;
  created_at: string;
};

export default function AdminStudentsPage() {
  const supabase = createClient();
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadStudents() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, full_name, matric_number, jamb_reg_number, level, faculty, department, phone, role, blocked, created_at"
      )
      .order("created_at", { ascending: false });
    setStudents(data ?? []);
    setLoading(false);
  }

  const duplicateMatrics = useMemo(() => {
    const counts = new Map<string, number>();
    students.forEach((s) => {
      if (!s.matric_number) return;
      counts.set(s.matric_number, (counts.get(s.matric_number) ?? 0) + 1);
    });
    return new Set(
      [...counts.entries()].filter(([, c]) => c > 1).map(([m]) => m)
    );
  }, [students]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      [s.full_name, s.matric_number, s.jamb_reg_number, s.phone]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    );
  }, [students, query]);

  async function toggleRole(student: Student) {
    setBusyId(student.id);
    setError(null);
    const newRole = student.role === "admin" ? "student" : "admin";
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", student.id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, role: newRole } : s))
    );
  }

  async function toggleBlocked(student: Student) {
    setBusyId(student.id);
    setError(null);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ blocked: !student.blocked })
      .eq("id", student.id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id ? { ...s, blocked: !s.blocked } : s
      )
    );
  }

  async function deleteStudent(student: Student) {
    setBusyId(student.id);
    setError(null);
    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: student.id }),
    });
    const json = await res.json();
    setBusyId(null);
    setConfirmDeleteId(null);

    if (!res.ok) {
      setError(json.error || "Could not delete this account.");
      return;
    }
    setStudents((prev) => prev.filter((s) => s.id !== student.id));
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Students</h1>
      <p className="mt-2 text-sm text-ink/60">
        {students.length} registered account{students.length === 1 ? "" : "s"}
        .
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, matric number, JAMB number, or phone"
        className="mt-6 w-full rounded-md border border-line bg-panel px-4 py-3 text-sm outline-none focus:border-forest"
      />

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-line">
        {loading ? (
          <p className="px-4 py-6 text-sm text-ink/50">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink/50">No matches.</p>
        ) : (
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-paper text-left text-ink/60">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Matric no.</th>
                <th className="px-4 py-2 font-medium">Level</th>
                <th className="px-4 py-2 font-medium">Phone</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const isFlagged =
                  !!s.matric_number && duplicateMatrics.has(s.matric_number);
                const isBusy = busyId === s.id;
                return (
                  <tr
                    key={s.id}
                    className={`border-t border-line ${
                      isFlagged ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="px-4 py-2 text-ink">
                      {s.full_name || "—"}
                    </td>
                    <td className="px-4 py-2">
                      {s.matric_number || s.jamb_reg_number || "—"}
                      {isFlagged && (
                        <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                          duplicate
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">{s.level || "—"}</td>
                    <td className="px-4 py-2">{s.phone || "—"}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          s.role === "admin"
                            ? "bg-gold/30 text-forest"
                            : "bg-line text-ink/60"
                        }`}
                      >
                        {s.role}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {s.blocked ? (
                        <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                          Blocked
                        </span>
                      ) : (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          disabled={isBusy}
                          onClick={() => toggleRole(s)}
                          className="rounded border border-line px-2 py-1 hover:border-forest hover:text-forest disabled:opacity-50"
                        >
                          {s.role === "admin" ? "Remove admin" : "Make admin"}
                        </button>
                        <button
                          disabled={isBusy}
                          onClick={() => toggleBlocked(s)}
                          className="rounded border border-line px-2 py-1 hover:border-forest hover:text-forest disabled:opacity-50"
                        >
                          {s.blocked ? "Unblock" : "Block"}
                        </button>
                        {confirmDeleteId === s.id ? (
                          <>
                            <button
                              disabled={isBusy}
                              onClick={() => deleteStudent(s)}
                              className="rounded bg-red-600 px-2 py-1 text-paper hover:bg-red-700 disabled:opacity-50"
                            >
                              Confirm delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="rounded border border-line px-2 py-1"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            disabled={isBusy}
                            onClick={() => setConfirmDeleteId(s.id)}
                            className="rounded border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
