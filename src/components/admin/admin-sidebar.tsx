"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, CircleCheck, X } from "lucide-react";

import { navSections } from "@/components/admin/nav-config";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

export function AdminSidebar() {
  const pathname = usePathname();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const mobileOpen = useUiStore((state) => state.mobileSidebarOpen);
  const setMobileOpen = useUiStore((state) => state.setMobileSidebarOpen);

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        className={cn(
          "fixed inset-0 z-40 bg-black/20 opacity-0 backdrop-blur-[2px] transition-opacity lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none",
        )}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] -translate-x-full flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-foreground transition-[transform,width] duration-200 lg:sticky lg:top-0 lg:translate-x-0",
          mobileOpen && "translate-x-0",
          collapsed ? "lg:w-[72px]" : "lg:w-[260px]",
        )}
      >
        <div className="flex h-16 items-center border-b border-[var(--sidebar-border)] px-3.5">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#dededb] bg-white shadow-[0_2px_3px_rgb(24_24_27/0.10)]">
              <Image src="/wenitro-logo.png" alt="WeNitro" width={32} height={32} className="h-7 w-7 object-contain" priority />
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#202020]">WeNitro Admin</p>
                <p className="truncate text-[10px] text-[#9b9a97]">Production workspace</p>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <TooltipProvider>
          <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3">
            {!collapsed ? (
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9b9a97]">Workspace</p>
            ) : null}

            <div className="space-y-0.5">
              {navSections.map((section) => {
                const Icon = section.icon;
                const active = pathname.startsWith(section.href);
                const hasChildren = Boolean(section.children?.length);
                const itemClass = cn(
                  "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-[#5f5e5b] transition-colors hover:bg-[#efefed] hover:text-[#202020]",
                  active && "bg-[#efefed] font-semibold text-[#202020]",
                  collapsed && "justify-center px-2",
                );

                if (!hasChildren) {
                  return (
                    <Tooltip key={section.title}>
                      <TooltipTrigger asChild>
                        <Link href={section.href} className={itemClass} onClick={() => setMobileOpen(false)}>
                          <span className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#dededb] bg-white text-[#202020] shadow-[0_2px_3px_rgb(24_24_27/0.10),inset_0_1px_0_white] transition-all group-hover:-translate-y-px group-hover:shadow-[0_3px_5px_rgb(24_24_27/0.14)]",
                            active && "border-black bg-[#202020] text-white shadow-[0_3px_0_#000,0_5px_8px_rgb(24_24_27/0.16)]",
                          )}>
                            <Icon className="h-4 w-4" strokeWidth={2} />
                          </span>
                          {!collapsed && <span className="flex-1 text-left">{section.title}</span>}
                        </Link>
                      </TooltipTrigger>
                      {collapsed && <TooltipContent side="right">{section.title}</TooltipContent>}
                    </Tooltip>
                  );
                }

                return (
                  <Collapsible key={section.title} defaultOpen={active}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CollapsibleTrigger className={itemClass}>
                          <span className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#dededb] bg-white text-[#202020] shadow-[0_2px_3px_rgb(24_24_27/0.10),inset_0_1px_0_white] transition-all group-hover:-translate-y-px group-hover:shadow-[0_3px_5px_rgb(24_24_27/0.14)]",
                            active && "border-black bg-[#202020] text-white shadow-[0_3px_0_#000,0_5px_8px_rgb(24_24_27/0.16)]",
                          )}>
                            <Icon className="h-4 w-4" strokeWidth={2} />
                          </span>
                          {!collapsed && <span className="flex-1 text-left">{section.title}</span>}
                          {!collapsed && <ChevronDown className="h-3.5 w-3.5 text-[#9b9a97]" />}
                        </CollapsibleTrigger>
                      </TooltipTrigger>
                      {collapsed && <TooltipContent side="right">{section.title}</TooltipContent>}
                    </Tooltip>

                    {!collapsed ? (
                      <CollapsibleContent className="pb-1 pl-[27px] pt-0.5">
                        <div className="border-l border-[#dededb] pl-2">
                          {section.children?.map((item) => {
                            const childActive = pathname === item.href.split("?")[0];
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                  "block rounded-md px-2.5 py-1.5 text-[12px] font-medium text-[#787774] transition-colors hover:bg-[#efefed] hover:text-[#202020]",
                                  childActive && "bg-white text-[#202020] shadow-[inset_2px_0_0_#2563eb]",
                                )}
                                onClick={() => setMobileOpen(false)}
                              >
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    ) : null}
                  </Collapsible>
                );
              })}
            </div>
          </nav>
        </TooltipProvider>

        <div className="border-t border-[var(--sidebar-border)] p-3">
          <div className={cn("flex items-center gap-2.5 rounded-md px-2 py-2", collapsed && "justify-center px-0")}>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-700">
              <CircleCheck className="h-4 w-4" />
            </span>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#37352f]">Supabase connected</p>
                <p className="text-[10px] text-[#9b9a97]">Live production data</p>
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}
