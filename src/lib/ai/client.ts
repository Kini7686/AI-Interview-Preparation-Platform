import {
  reportRubricSchema,
  type ReportRubric,
} from "@/lib/validation/app.schema";

export type GenerateReportInput = {
  roleTitle: string;
  resumeSummary: string;
  turns: { question: string; answer: string }[];
};

/**
 * AI facade (AD-5). Local heuristic adapter for MVP without an API key.
 * Swap providers here later without changing call sites.
 */
export async function generateInterviewReport(
  input: GenerateReportInput,
): Promise<{
  report: ReportRubric;
  promptId: string;
  promptVersion: string;
  modelId: string;
}> {
  const draft = localHeuristicReport(input);
  const parsed = reportRubricSchema.safeParse(draft);
  if (!parsed.success) {
    throw new Error("Report validation failed");
  }
  return {
    report: parsed.data,
    promptId: "interview-report",
    promptVersion: "1.0.0",
    modelId: "local-heuristic",
  };
}

function clampScore(n: number): number {
  return Math.min(5, Math.max(1, Math.round(n)));
}

function localHeuristicReport(input: GenerateReportInput): ReportRubric {
  const answers = input.turns.map((t) => t.answer);
  const avgLen =
    answers.reduce((sum, a) => sum + a.length, 0) / Math.max(answers.length, 1);
  const hasStructure = answers.filter((a) => /first|then|finally|because|for example/i.test(a)).length;
  const hasTech = answers.filter((a) => /api|database|react|server|test|deploy|latency|cache/i.test(a)).length;

  const clarity = clampScore(2 + avgLen / 180);
  const structure = clampScore(2 + (hasStructure / Math.max(answers.length, 1)) * 3);
  const technicalDepth = clampScore(2 + (hasTech / Math.max(answers.length, 1)) * 3);
  const relevance = clampScore(3 + Math.min(2, input.resumeSummary.length / 400));

  return {
    clarity,
    structure,
    technicalDepth,
    relevance,
    overallSummary: `Practice report for ${input.roleTitle}. You completed ${input.turns.length} turns. Scores are heuristic practice feedback (local model) until a production LLM provider is configured.`,
    strengths:
      avgLen > 200
        ? "Answers generally include enough detail to evaluate. Keep grounding examples in your resume projects."
        : "You completed the session and provided usable responses to score against the rubric.",
    improvements:
      structure < 4
        ? "Use a clearer structure (situation → action → result) and call out tradeoffs explicitly."
        : "Push deeper on technical decisions and quantify impact where possible.",
  };
}
