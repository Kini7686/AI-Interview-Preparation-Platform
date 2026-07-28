import { MixPreset } from "@prisma/client";

export const MIN_RESUME_SUMMARY_CHARS = 100;

export const DURATION_OPTIONS = [15, 30] as const;
export const QUESTION_COUNT_OPTIONS = [5, 8] as const;

export const MIX_PRESET_LABELS: Record<MixPreset, string> = {
  behavioral_heavy: "Behavioral-heavy",
  balanced: "Balanced",
  technical_heavy: "Technical-heavy",
};

const BEHAVIORAL = [
  "Tell me about a challenging project you worked on and your specific contribution.",
  "Describe a time you disagreed with a teammate. How did you resolve it?",
  "Walk me through how you prioritize work when everything feels urgent.",
  "Tell me about a mistake you made and what you learned from it.",
  "Describe a time you had to learn something quickly to deliver on a deadline.",
];

const TECHNICAL = [
  "Explain how you would design a simple REST API for a to-do app.",
  "How do you debug a production issue you cannot reproduce locally?",
  "What tradeoffs would you consider between SQL and NoSQL for user profiles?",
  "How would you improve the performance of a slow web page?",
  "Describe how authentication and authorization differ in a web application.",
];

export function buildQuestionBank(
  mix: MixPreset,
  count: number,
  roleTitle: string,
): string[] {
  const rolePrefix = `For the ${roleTitle} role: `;
  let pool: string[];
  if (mix === "behavioral_heavy") {
    pool = [...BEHAVIORAL, ...BEHAVIORAL, ...TECHNICAL];
  } else if (mix === "technical_heavy") {
    pool = [...TECHNICAL, ...TECHNICAL, ...BEHAVIORAL];
  } else {
    pool = [];
    for (let i = 0; i < Math.max(BEHAVIORAL.length, TECHNICAL.length); i++) {
      if (BEHAVIORAL[i]) pool.push(BEHAVIORAL[i]!);
      if (TECHNICAL[i]) pool.push(TECHNICAL[i]!);
    }
  }
  return Array.from({ length: count }, (_, i) => {
    const q = pool[i % pool.length] ?? BEHAVIORAL[0]!;
    return `${rolePrefix}${q}`;
  });
}

export function canAcceptAnswers(status: string): boolean {
  return status === "in_progress";
}

export function canGenerateReport(status: string): boolean {
  return (
    status === "completed" ||
    status === "ended_early" ||
    status === "completed_pending_report"
  );
}
