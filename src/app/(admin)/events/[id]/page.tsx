import { notFound } from "next/navigation";

import { EventDetailCard } from "@/components/admin/event-detail-card";
import { getEventDetail } from "@/lib/api";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventDetail(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <EventDetailCard event={event} />
    </div>
  );
}
