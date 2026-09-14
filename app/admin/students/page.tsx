"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Student = {
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

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  unverified: "bg-yellow-100 text-yellow-700",
  suspended: "bg-orange-100 text-orange-700",
  banned: "bg-red-100 text-red-700",
};

export default function AdminStudentsPage() {
  const supabase = createClient();
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadStudents() {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_user_directory");
    if (error) setError(error.message);
    setStudents((data as Student[]) ?? []);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      const matchesQuery =
        !q ||
        [s.full_name, s.email, s.matric_number, s.jamb_reg_number, s.phone]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q));
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [students, query, statusFilter]);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Students</h1>
      <p className="mt-2 text-sm text-ink/60">
        {students.length} registered account{students.length === 1 ? "" : "s"}.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, matric, or phone"
          className="min-w-[280px] flex-1 rounded-md border border-line bg-panel px-4 py-2 text-sm outline-none focus:border-forest"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-forest"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="unverified">Unverified</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

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
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-paper text-left text-ink/60">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Matric no.</th>
                <th className="px-4 py-2 font-medium">Level</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Last login</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="cursor-pointer border-t border-line hover:bg-paper"
                >
                  <td className="px-0 py-0">
                    <Link
                      href={`/admin/students/${s.id}`}
                      className="block px-4 py-2 font-medium text-ink"
                    >
                      {s.full_name || "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    {s.matric_number || s.jamb_reg_number || "—"}
                  </td>
                  <td className="px-4 py-2">{s.level || "—"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        s.role !== "student"
                          ? "bg-gold/30 text-forest"
                          : "bg-line text-ink/60"
                      }`}
                    >
                      {s.role}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[s.status] ?? "bg-line text-ink/60"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-ink/60">
                    {s.last_sign_in_at
                      ? new Date(s.last_sign_in_at).toLocaleDateString()
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
