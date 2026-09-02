import { InvestigationPanel } from "@/components/admin/investigation-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvestigationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Investigation Panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deep-dive into reported accounts — review event history, chat logs, uploaded images, risk scores, and take disciplinary action.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Cases</CardTitle>
          <CardDescription>Select a case from the left panel to review the full investigation details.</CardDescription>
        </CardHeader>
        <CardContent>
          <InvestigationPanel />
        </CardContent>
      </Card>
    </div>
  );
}
