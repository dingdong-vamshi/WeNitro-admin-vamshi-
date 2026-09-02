import { LanguageSettingsScreen } from "@/components/admin/language-settings-screen";

export default function LanguageSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Language Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enable multi-language support for the platform.
        </p>
      </div>
      <LanguageSettingsScreen />
    </div>
  );
}
