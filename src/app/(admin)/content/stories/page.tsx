import { LiveContentScreen } from "@/components/admin/live-content-screen";
import { ImageModerationQueueGrid } from "@/components/admin/image-moderation-queue";

export default function StoriesPage() { return <div className="space-y-6"><section><h1 className="mb-4 text-2xl font-semibold">Pending Story reviews</h1><ImageModerationQueueGrid scope="story" /></section><LiveContentScreen kind="stories" /></div>; }
