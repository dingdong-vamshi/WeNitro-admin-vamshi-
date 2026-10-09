import type { SafetyReport } from "@/types/admin";

const appBase = "https://wenitro-app.vercel.app/#";

export function reportTargetType(report: Pick<SafetyReport, "sourceType">) {
  if (report.sourceType === "event") return "Activity";
  if (report.sourceType === "community") return "Community";
  if (report.sourceType === "vibe") return "Content / Vibe";
  return "User";
}

export function reportTargetHref(report: Pick<SafetyReport, "sourceType" | "targetId">) {
  if (report.sourceType === "event") return `${appBase}/activity/${report.targetId}`;
  if (report.sourceType === "community") return `${appBase}/community/${report.targetId}`;
  if (report.sourceType === "vibe") return `${appBase}/vibe/${report.targetId}`;
  return `${appBase}/profile/${report.targetId}`;
}

export function reportStatusLabel(report: Pick<SafetyReport, "status">) {
  return report.status === "investigating" ? "Investigating" : report.status[0].toUpperCase() + report.status.slice(1);
}

export function reportSubmittedAt(value: string) {
  if (!value) return "Time unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Time unavailable" : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function reportEvidenceContext(report: Pick<SafetyReport, "evidenceCount">) {
  if (report.evidenceCount > 0) return `${report.evidenceCount} evidence file${report.evidenceCount === 1 ? "" : "s"} attached.`;
  return "No file evidence is stored. The reporter description is the submitted context.";
}
