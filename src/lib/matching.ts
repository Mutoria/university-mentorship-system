export function normalizeSkill(s: string) {
  return s.trim().toLowerCase();
}

export function scoreApplicant(
  required: string[],
  skills: string[],
  projectCount: number,
  experienceCount: number
) {
  const have = new Set(skills.map(normalizeSkill));
  const matched = required.filter((r) => have.has(normalizeSkill(r)));
  const missing = required.filter((r) => !have.has(normalizeSkill(r)));
  const coverage = required.length ? matched.length / required.length : 0;
  const score = Math.round(
    coverage * 80 + Math.min(projectCount, 2) * 5 + (experienceCount > 0 ? 10 : 0)
  );
  return { score: Math.min(score, 100), matched, missing };
}

export const SHORTLIST_THRESHOLD = 50;
