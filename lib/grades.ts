// Standard Nigerian university 5-point grading scale.
// If EKSU uses a different scale for a course, adjust here.
export const GRADE_POINTS: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

export const GRADE_LETTERS = Object.keys(GRADE_POINTS);

export type Course = {
  id: string;
  code: string;
  units: number;
  grade: string;
};

export function calculateGPA(courses: Course[]): {
  totalUnits: number;
  totalPoints: number;
  gpa: number;
} {
  const totalUnits = courses.reduce((sum, c) => sum + (c.units || 0), 0);
  const totalPoints = courses.reduce(
    (sum, c) => sum + (c.units || 0) * (GRADE_POINTS[c.grade] ?? 0),
    0
  );
  const gpa = totalUnits > 0 ? totalPoints / totalUnits : 0;
  return { totalUnits, totalPoints, gpa: Number(gpa.toFixed(2)) };
}
