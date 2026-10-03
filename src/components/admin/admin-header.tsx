"use client";

import { useEffect, useRef, useState } from "react";
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
import { useRouter } from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {getPendingReportItems} from "@/lib/api";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from "@/components/ui/dialog";
import { useAdminAuth } from "@/components/AdminAuthGate";

export function AdminHeader() {
  const { role, session, signOut } = useAdminAuth();
  const router=useRouter(),searchInput=useRef<HTMLInputElement>(null);
  const [search,setSearch]=useState(""),[panel,setPanel]=useState<"help"|"profile"|null>(null);
  const operations=role!=="finance_admin";
  const pending=useQuery({queryKey:["header-pending-reports"],enabled:operations,queryFn:()=>getPendingReportItems({pageSize:1}),refetchInterval:60000});
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();searchInput.current?.focus();}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);},[]);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const toggleMobileSidebar = useUiStore((state) => state.toggleMobileSidebar);
  const label = role.replaceAll("_", " ").replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
  const email = session.user.email ?? "Admin account";
  const initials = label.split(" ").map((word) => word[0]).join("").slice(0, 2);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(null);
    try {
      await signOut();
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : "Sign out failed.");
      setSigningOut(false);
    }
  }

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

          

          {operations&&<form onSubmit={e=>{e.preventDefault();if(search.trim())router.push(`/search?q=${encodeURIComponent(search.trim())}`);}} className="hidden max-w-xl flex-1 items-center gap-2 rounded-md border border-transparent bg-[#f1f1ef] px-3 transition-colors focus-within:border-border focus-within:bg-white md:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInput} value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search users, activities, reports..."
              className="h-9 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">⌘K</kbd>
          </form>}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" aria-label="Help and support" onClick={()=>setPanel("help")}>
            <HelpCircle className="h-4 w-4" />
          </Button>

          {operations&&<Button onClick={()=>router.push("/moderation/pending-reports")} variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {!!pending.data?.total&&<span aria-label={`${pending.data.total} pending reports`} className="absolute right-0 top-0 rounded-full bg-rose-500 px-1 text-[10px] text-white">{pending.data.total}</span>}
          </Button>}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 gap-2 rounded-lg px-2">
                <Avatar className="h-8 w-8 ring-2 ring-primary/15">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-[11px] font-semibold">{label}</p>
                  <p className="max-w-36 truncate text-[10px] text-muted-foreground">{email}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={()=>setPanel("profile")}>Admin profile</DropdownMenuItem>
              {operations&&<DropdownMenuItem onSelect={()=>router.push("/settings")}>Settings</DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={signingOut} onSelect={() => void handleSignOut()}>
                {signingOut ? "Signing out…" : "Logout"}
              </DropdownMenuItem>
              {signOutError ? <p className="max-w-64 px-2 py-1 text-xs text-destructive">{signOutError}</p> : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Dialog open={panel!==null} onOpenChange={open=>{if(!open)setPanel(null)}}><DialogContent><DialogHeader><DialogTitle>{panel==="profile"?"Admin profile":"Admin help"}</DialogTitle><DialogDescription>{panel==="profile"?"Current authenticated administrator":"Use the workspace navigation to manage members, Activities, reports and Partner operations."}</DialogDescription></DialogHeader>{panel==="profile"?<dl className="space-y-2"><dt>Email</dt><dd>{email}</dd><dt>Role</dt><dd>{label}</dd><dt>Last sign-in</dt><dd>{session.user.last_sign_in_at?new Date(session.user.last_sign_in_at).toLocaleString():"Unavailable"}</dd></dl>:<div className="space-y-3 text-sm"><p>Account access is managed by the Super Admin. Operational changes require reasons and appear in the audit. Finance actions are restricted to Finance Admin and Super Admin.</p><a className="underline" href="https://wenitro.com" target="_blank" rel="noreferrer">WeNitro website and policies</a></div>}</DialogContent></Dialog>
    </header>
  );
}
