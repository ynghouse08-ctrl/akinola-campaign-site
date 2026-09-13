"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { calculateGPA, type Course } from "@/lib/grades";
import CourseTable from "@/components/CourseTable";

type Tab = "gpa" | "cgpa" | "history";

type Record = {
  id: string;
  label: string;
  gpa: number | null;
  cgpa: number | null;
  total_units: number | null;
  created_at: string;
};

function newCourse(): Course {
  return { id: crypto.randomUUID(), code: "", units: 3, grade: "A" };
}

export default function GpaCalculatorPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("gpa");
  const [records, setRecords] = useState<Record[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // GPA tab state
  const [gpaCourses, setGpaCourses] = useState<Course[]>([newCourse()]);
  const [gpaLabel, setGpaLabel] = useState("");
  const [gpaSaveMsg, setGpaSaveMsg] = useState<string | null>(null);

  // CGPA tab state
  const [prevUnits, setPrevUnits] = useState(0);
  const [prevPoints, setPrevPoints] = useState(0);
  const [cgpaCourses, setCgpaCourses] = useState<Course[]>([newCourse()]);
  const [cgpaLabel, setCgpaLabel] = useState("");
  const [cgpaSaveMsg, setCgpaSaveMsg] = useState<string | null>(null);

  const gpaResult = calculateGPA(gpaCourses);
  const cgpaThisSemester = calculateGPA(cgpaCourses);
  const cgpaTotalUnits = prevUnits + cgpaThisSemester.totalUnits;
  const cgpaTotalPoints = prevPoints + cgpaThisSemester.totalPoints;
  const cgpaResult =
    cgpaTotalUnits > 0
      ? Number((cgpaTotalPoints / cgpaTotalUnits).toFixed(2))
      : 0;

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadHistory() {
    setLoadingHistory(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("gpa_records")
      .select("id, label, gpa, cgpa, total_units, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    setRecords(data ?? []);
    setLoadingHistory(false);
  }

  async function saveGpa() {
    setGpaSaveMsg(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("gpa_records").insert({
      user_id: user.id,
      label: gpaLabel || "Untitled semester",
      gpa: gpaResult.gpa,
      cgpa: null,
      total_units: gpaResult.totalUnits,
    });

    setGpaSaveMsg(error ? error.message : "Saved to your history.");
    if (!error) loadHistory();
  }

  async function saveCgpa() {
    setCgpaSaveMsg(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("gpa_records").insert({
      user_id: user.id,
      label: cgpaLabel || "Untitled semester",
      gpa: cgpaThisSemester.gpa,
      cgpa: cgpaResult,
      total_units: cgpaTotalUnits,
    });

    setCgpaSaveMsg(error ? error.message : "Saved to your history.");
    if (!error) loadHistory();
  }

  const chartData = records
    .filter((r) => r.cgpa !== null)
    .map((r) => ({ label: r.label, cgpa: r.cgpa }));

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl text-ink">GPA / CGPA calculator</h1>
      <p className="mt-2 text-sm text-ink/60">
        Standard 5-point scale (A=5, B=4, C=3, D=2, E=1, F=0).
      </p>

      <div className="mt-6 flex gap-2 border-b border-line">
        {[
          { id: "gpa", label: "Semester GPA" },
          { id: "cgpa", label: "Cumulative CGPA" },
          { id: "history", label: "History" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`px-4 py-2 text-sm ${
              tab === t.id
                ? "border-b-2 border-forest font-medium text-forest"
                : "text-ink/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "gpa" && (
        <div className="mt-6 space-y-4">
          <input
            value={gpaLabel}
            onChange={(e) => setGpaLabel(e.target.value)}
            placeholder="Semester label, e.g. 300L Harmattan 2026"
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
          />
          <CourseTable courses={gpaCourses} onChange={setGpaCourses} />

          <div className="flex items-center justify-between rounded-lg bg-forest px-6 py-4 text-paper">
            <div>
              <p className="text-xs text-paper/70">Your GPA</p>
              <p className="font-display text-2xl">{gpaResult.gpa}</p>
            </div>
            <div className="text-right text-xs text-paper/70">
              {gpaResult.totalUnits} total units
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveGpa}
              className="rounded-md bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-forest"
            >
              Save to history
            </button>
            {gpaSaveMsg && (
              <span className="text-sm text-ink/60">{gpaSaveMsg}</span>
            )}
          </div>
        </div>
      )}

      {tab === "cgpa" && (
        <div className="mt-6 space-y-4">
          <input
            value={cgpaLabel}
            onChange={(e) => setCgpaLabel(e.target.value)}
            placeholder="Semester label, e.g. 300L Rain 2026"
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
          />

          <div className="grid grid-cols-2 gap-4 rounded-lg border border-line bg-panel p-4">
            <div>
              <label className="text-xs font-medium text-ink/70">
                Previous total units (before this semester)
              </label>
              <input
                type="number"
                min={0}
                value={prevUnits}
                onChange={(e) => setPrevUnits(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/70">
                Previous total quality points
              </label>
              <input
                type="number"
                min={0}
                value={prevPoints}
                onChange={(e) => setPrevPoints(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
              />
              <p className="mt-1 text-xs text-ink/40">
                Previous CGPA × previous total units, if you don&apos;t have
                this saved exactly.
              </p>
            </div>
          </div>

          <p className="text-sm font-medium text-ink/70">
            This semester&apos;s courses
          </p>
          <CourseTable courses={cgpaCourses} onChange={setCgpaCourses} />

          <div className="flex items-center justify-between rounded-lg bg-forest px-6 py-4 text-paper">
            <div>
              <p className="text-xs text-paper/70">This semester&apos;s GPA</p>
              <p className="font-display text-2xl">{cgpaThisSemester.gpa}</p>
            </div>
            <div>
              <p className="text-xs text-paper/70">New cumulative CGPA</p>
              <p className="font-display text-2xl text-gold">{cgpaResult}</p>
            </div>
            <div className="text-right text-xs text-paper/70">
              {cgpaTotalUnits} total units
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveCgpa}
              className="rounded-md bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-forest"
            >
              Save to history
            </button>
            {cgpaSaveMsg && (
              <span className="text-sm text-ink/60">{cgpaSaveMsg}</span>
            )}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="mt-6 space-y-6">
          {loadingHistory ? (
            <p className="text-sm text-ink/50">Loading…</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-ink/50">
              No saved records yet — calculate and save your GPA or CGPA to
              see your history here.
            </p>
          ) : (
            <>
              {chartData.length > 1 && (
                <div className="h-64 rounded-lg border border-line bg-panel p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="#DBE1D6" strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="cgpa"
                        stroke="#C9A227"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="overflow-hidden rounded-lg border border-line">
                <table className="w-full text-sm">
                  <thead className="bg-paper text-left text-ink/60">
                    <tr>
                      <th className="px-4 py-2 font-medium">Semester</th>
                      <th className="px-4 py-2 font-medium">GPA</th>
                      <th className="px-4 py-2 font-medium">CGPA</th>
                      <th className="px-4 py-2 font-medium">Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records
                      .slice()
                      .reverse()
                      .map((r) => (
                        <tr key={r.id} className="border-t border-line">
                          <td className="px-4 py-2">{r.label}</td>
                          <td className="px-4 py-2">{r.gpa ?? "—"}</td>
                          <td className="px-4 py-2">{r.cgpa ?? "—"}</td>
                          <td className="px-4 py-2">{r.total_units ?? "—"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
