import { ImageModerationQueueGrid } from "@/components/admin/image-moderation-queue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImageModerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Image Moderation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Inspect text and image submissions that could not be published automatically.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OpenAI moderation review</CardTitle>
          <CardDescription>Pending and review items remain private until a safe or administrator-approved decision exists.</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageModerationQueueGrid />
        </CardContent>
      </Card>
    </div>
  );
}
