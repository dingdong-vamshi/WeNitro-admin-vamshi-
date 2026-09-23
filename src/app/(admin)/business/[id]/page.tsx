import { PartnerApplicationDetailScreen } from "@/components/admin/partner-application-detail-screen";

export default async function PartnerApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = Number(id);
  return <PartnerApplicationDetailScreen userId={Number.isInteger(userId) && userId > 0 ? userId : 0} />;
}
