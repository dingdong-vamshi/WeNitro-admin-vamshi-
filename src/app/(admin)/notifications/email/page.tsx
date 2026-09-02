import { EmailCampaignsTable } from "@/components/admin/email-campaigns-table";

export default function EmailNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Email Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage email campaigns including welcome emails, reminders, and newsletters.
        </p>
      </div>
      <EmailCampaignsTable />
    </div>
  );
}
