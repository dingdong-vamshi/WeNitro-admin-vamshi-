import { FeatureTogglesScreen } from "@/components/admin/feature-toggles-screen";

export default function FeatureTogglesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Feature Toggles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enable or disable platform features dynamically. Useful for beta and experimental features.
        </p>
      </div>
      <FeatureTogglesScreen />
    </div>
  );
}
