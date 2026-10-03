import { notFound, redirect } from 'next/navigation';
/** Keep saved links useful while the existing authenticated Activity page owns all controls. */
export default async function SponsoredEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) notFound();
  redirect(`/events/${encodeURIComponent(id)}`);
}
