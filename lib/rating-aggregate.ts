export type RatingRow = { score: number; driver_id?: string; employer_id?: string };

export function aggregateBySubjectId(
  rows: RatingRow[],
  subjectKey: "driver_id" | "employer_id"
): Map<string, { avg: number; count: number }> {
  const sums = new Map<string, { sum: number; count: number }>();
  for (const r of rows) {
    const id = r[subjectKey];
    if (!id) continue;
    const cur = sums.get(id) ?? { sum: 0, count: 0 };
    cur.sum += r.score;
    cur.count += 1;
    sums.set(id, cur);
  }
  const out = new Map<string, { avg: number; count: number }>();
  sums.forEach((v, k) => {
    out.set(k, { avg: v.sum / v.count, count: v.count });
  });
  return out;
}
