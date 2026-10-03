import { InvestigationPanel } from "@/components/admin/investigation-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvestigationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Investigation Panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review submitted reports, current account status and activity history, with recorded report decisions and account restrictions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reported accounts</CardTitle>
          <CardDescription>Select an account to review its actual reports. Closed reports remain available by clearing Open reports only.</CardDescription>
        </CardHeader>
        <CardContent>
          <InvestigationPanel />
        </CardContent>
      </Card>
    </div>
  );
}
