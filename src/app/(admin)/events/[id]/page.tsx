"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { EventDetailCard } from "@/components/admin/event-detail-card";
import { AdminDataState } from "@/components/admin/admin-data-state";
import { getEventDetail } from "@/lib/api";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery({ queryKey: ["activity-detail", id], queryFn: () => getEventDetail(id), enabled: Boolean(id) });
  if (query.isLoading) return <AdminDataState title="activity details" loading />;
  if (query.error) return <AdminDataState title="activity details" error={query.error} onRetry={() => void query.refetch()} />;
  if (!query.data) return <AdminDataState title="activity record" empty />;

  return (
    <div className="space-y-6">
      <EventDetailCard event={query.data} />
    </div>
  );
}
