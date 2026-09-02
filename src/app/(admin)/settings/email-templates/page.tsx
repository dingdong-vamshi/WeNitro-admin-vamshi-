import { EmailTemplatesScreen } from "@/components/admin/email-templates-screen";

export default function EmailTemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Email Templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage automated email templates for platform events.
        </p>
      </div>
      <EmailTemplatesScreen />
    </div>
  );
}
