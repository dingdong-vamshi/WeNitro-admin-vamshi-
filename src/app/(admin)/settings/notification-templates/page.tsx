import { NotificationTemplatesScreen } from "@/components/admin/notification-templates-screen";

export default function NotificationTemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notification Templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage predefined push and in-app notification messages.
        </p>
      </div>
      <NotificationTemplatesScreen />
    </div>
  );
}
