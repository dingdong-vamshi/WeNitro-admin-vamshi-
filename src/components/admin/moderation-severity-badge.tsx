import { Badge } from "@/components/ui/badge";
import type { ModerationSeverity } from "@/types/admin";

const severityVariant: Record<ModerationSeverity, "secondary" | "warning" | "danger" | "caution"> = {
  low: "secondary",
  medium: "warning",
  high: "caution",
  critical: "danger",
};

const severityLabel: Record<ModerationSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function ModerationSeverityBadge({ severity }: { severity: ModerationSeverity }) {
  return (
    <Badge variant={severityVariant[severity]}>{severityLabel[severity]}</Badge>
  );
}
