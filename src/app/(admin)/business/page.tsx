import { BusinessAccountsTable } from "@/components/admin/business-accounts-table";
import { Card, CardContent } from "@/components/ui/card";

export default function BusinessAccountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Business Accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage companies, brands, and organisations hosting sponsored events on the platform.
        </p>
      </div>

      <Card>
        <CardContent className="pt-5">
          <BusinessAccountsTable />
        </CardContent>
      </Card>
    </div>
  );
}

