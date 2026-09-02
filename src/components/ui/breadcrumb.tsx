import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" className={cn("text-sm", className)} {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol className={cn("flex flex-wrap items-center gap-1.5 text-muted-foreground", className)} {...props} />;
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
}

function BreadcrumbLink({ className, href, ...props }: React.ComponentProps<typeof Link>) {
  return <Link href={href} className={cn("hover:text-foreground", className)} {...props} />;
}

function BreadcrumbCurrent({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("font-medium text-foreground", className)} {...props} />;
}

function BreadcrumbSeparator({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span role="presentation" aria-hidden="true" className={cn("text-muted-foreground", className)} {...props}>
      <ChevronRight className="h-4 w-4" />
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
};
