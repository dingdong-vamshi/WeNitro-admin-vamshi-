import { CategoryManagementScreen } from "@/components/admin/category-management-screen";

export default function CategoryManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Category Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage event categories displayed in the mobile app.
        </p>
      </div>
      <CategoryManagementScreen />
    </div>
  );
}
