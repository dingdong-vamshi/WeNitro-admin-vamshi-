import { SectionShell } from "@/components/admin/section-shell";
import { SecurityInsightsSection } from "@/components/admin/security-insights";

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <SecurityInsightsSection />
      <SectionShell
        title="Safety & Security"
        description="Investigate abuse signals, block bad actors, and maintain audit visibility."
        sections={[
          { title: "Blocked Users", detail: "Centralized list of blocked accounts and appeals." },
          { title: "Safety Reports", detail: "Ingest community safety reports and escalation levels." },
          { title: "Abuse Detection", detail: "Monitor suspicious behavioral patterns and trust risk scores." },
          { title: "IP Monitoring", detail: "Track login anomalies and geo/IP mismatch patterns." },
          { title: "Security Logs", detail: "Audit admin actions and privileged event history." },
        ]}
      />
    </div>
  );
}
