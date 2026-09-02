"use client";

import { Bell, ChevronDown, HelpCircle, Menu, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/store/ui-store";

export function AdminHeader() {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const toggleMobileSidebar = useUiStore((state) => state.toggleMobileSidebar);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            aria-label="Toggle navigation"
            onClick={() => {
              if (window.innerWidth < 1024) toggleMobileSidebar();
              else toggleSidebar();
            }}
          >
            <Menu className="h-4 w-4" />
          </Button>



          <div className="hidden max-w-xl flex-1 items-center gap-2 rounded-md border border-transparent bg-[#f1f1ef] px-3 transition-colors focus-within:border-border focus-within:bg-white md:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users, activities, reports..."
              className="h-9 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">⌘K</kbd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" aria-label="Help and support">
            <HelpCircle className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-background bg-rose-500" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 gap-2 rounded-lg px-2">
                <Avatar className="h-8 w-8 ring-2 ring-primary/15">
                  <AvatarFallback>SA</AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-[11px] font-semibold">Super Admin</p>
                  <p className="text-[10px] text-muted-foreground">Platform owner</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Admin profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
