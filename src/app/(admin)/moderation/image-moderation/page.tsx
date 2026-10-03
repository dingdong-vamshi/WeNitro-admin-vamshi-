import { ImageModerationQueueGrid } from "@/components/admin/image-moderation-queue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImageModerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Image Moderation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review member reports about media and open the reported content.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Media-related member reports</CardTitle>
          <CardDescription>Automated image classification is unavailable. Manual report decisions and existing content controls remain available.</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageModerationQueueGrid />
        </CardContent>
      </Card>
    </div>
  );
}
