import { ImageModerationQueueGrid } from "@/components/admin/image-moderation-queue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImageModerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Image Moderation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review event photos flagged for nudity, violence, offensive symbols, or spam advertisements.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Moderation Queue</CardTitle>
          <CardDescription>AI-detected labels are shown on each image. Approve or remove images to clear the queue.</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageModerationQueueGrid />
        </CardContent>
      </Card>
    </div>
  );
}
