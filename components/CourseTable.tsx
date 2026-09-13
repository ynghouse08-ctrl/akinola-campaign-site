"use client";

import { GRADE_LETTERS, type Course } from "@/lib/grades";

export default function CourseTable({
  courses,
  onChange,
}: {
  courses: Course[];
  onChange: (courses: Course[]) => void;
}) {
  function updateRow(id: string, patch: Partial<Course>) {
    onChange(courses.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function addRow() {
    onChange([
      ...courses,
      { id: crypto.randomUUID(), code: "", units: 3, grade: "A" },
    ]);
  }

  function removeRow(id: string) {
    onChange(courses.filter((c) => c.id !== id));
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full text-sm">
        <thead className="bg-paper text-left text-ink/60">
          <tr>
            <th className="px-4 py-2 font-medium">Course code</th>
            <th className="px-4 py-2 font-medium">Units</th>
            <th className="px-4 py-2 font-medium">Grade</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id} className="border-t border-line">
              <td className="px-4 py-2">
                <input
                  value={course.code}
                  onChange={(e) =>
                    updateRow(course.id, { code: e.target.value })
                  }
                  placeholder="e.g. GET 102"
                  className="w-full rounded-md border border-line px-2 py-1.5 outline-none focus:border-forest"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={course.units}
                  onChange={(e) =>
                    updateRow(course.id, {
                      units: Number(e.target.value),
                    })
                  }
                  className="w-20 rounded-md border border-line px-2 py-1.5 outline-none focus:border-forest"
                />
              </td>
              <td className="px-4 py-2">
                <select
                  value={course.grade}
                  onChange={(e) =>
                    updateRow(course.id, { grade: e.target.value })
                  }
                  className="rounded-md border border-line px-2 py-1.5 outline-none focus:border-forest"
                >
                  {GRADE_LETTERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => removeRow(course.id)}
                  className="text-xs text-ink/40 hover:text-red-600"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addRow}
        className="w-full border-t border-line bg-paper py-2 text-sm text-forest hover:bg-goldsoft/40"
      >
        + Add course
      </button>
    </div>
  );
}
