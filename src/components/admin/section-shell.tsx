import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

export function SectionShell({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections: Array<{ title: string; detail: string }>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">Admin workspace</p>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section, index) => (
          <Card key={section.title} className="group transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_12px_30px_rgb(15_23_42/0.08)]">
            <CardHeader className="pb-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <CardTitle className="text-base">{section.title}</CardTitle>
              <CardDescription className="leading-relaxed">{section.detail}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-sky-500" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
