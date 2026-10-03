import { PushCampaignsTable } from "@/components/admin/push-campaigns-table";

export default function PushCampaignsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Push Notification Campaigns</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage saved push campaign drafts. Device push delivery requires a configured provider.
        </p>
      </div>
      <PushCampaignsTable />
    </div>
  );
}
