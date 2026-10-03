"use client";
import { ReportInvestigation } from './investigation-panel';
export function ImageModerationQueueGrid() {
  return <div className="space-y-4"><p className="rounded-lg border bg-muted/30 p-4 text-sm">Automated image moderation is not configured, so there are no classifier labels or image-approval results to display. Submitted reports mentioning images, photos, video or explicit content appear below. Open the reported Activity or profile to inspect its available content and use the existing moderation controls.</p><ReportInvestigation scope="image" /></div>;
}
