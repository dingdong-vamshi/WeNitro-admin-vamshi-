import { RevenueChart } from "@/components/charts/revenue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMonetization } from "@/lib/api";

export default async function MonetizationPage() {
  const revenue = await getMonetization();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Monetization Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Monitor sponsored ads, partnerships, campaigns, and payment records.</p>
      </div>

      <RevenueChart data={revenue} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Sponsored Event Ads", "124 Active"],
          ["Payment Records", "12,840 Processed"],
          ["Brand Partnerships", "38 Contracts"],
          ["Campaign Performance", "7.8% CTR Avg"],
        ].map(([title, value]) => (
          <Card key={title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-semibold">{value}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
