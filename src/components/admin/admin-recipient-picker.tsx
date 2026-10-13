"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { listWorkspaceRecipients } from "@/lib/admin-workspace";
import { parseRecipientIds } from "@/lib/workspace-validation";

export function AdminRecipientPicker({ value, onChange, disabled = false, allowAll = false, max = 500 }: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  allowAll?: boolean;
  max?: number;
}) {
  const [search, setSearch] = useState("");
  const directory = useQuery({ queryKey: ["workspace-recipient-directory"], queryFn: listWorkspaceRecipients, staleTime: 60_000 });
  const parsed = parseRecipientIds(value);
  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term.length < 2) return [];
    const chosen = new Set(parsed.ids);
    return (directory.data ?? []).filter(member => !chosen.has(member.id) &&
      [String(member.id), member.name, member.username, member.email].some(field => field.toLowerCase().includes(term))).slice(0, 8);
  }, [directory.data, parsed.ids, search]);
  const selected = useMemo(() => {
    const byId = new Map((directory.data ?? []).map(member => [member.id, member]));
    return parsed.ids.map(id => byId.get(id) ?? { id, name: `Member ID ${id}`, username: "", email: "", isTestAccount: false });
  }, [directory.data, parsed.ids]);
  const add = (id: number) => { onChange([...parsed.ids, id].join(", ")); setSearch(""); };
  const remove = (id: number) => onChange(parsed.ids.filter(valueId => valueId !== id).join(", "));

  return <section className="space-y-2 rounded border p-3">
    <label className="block text-sm">Search recipients by name, username, or email
      <Input aria-label="Search recipients" value={search} disabled={disabled} onChange={event => setSearch(event.target.value)} placeholder="Start typing a member name" />
    </label>
    {directory.isFetching && <p className="text-xs text-muted-foreground">Loading members…</p>}
    {directory.isError && <p role="alert" className="text-sm text-destructive">Could not load the member directory. Advanced ID entry is still available.</p>}
    {results.length > 0 && <div className="max-h-48 overflow-y-auto rounded border" aria-label="Recipient search results">{results.map(member =>
      <button type="button" className="flex w-full items-center justify-between border-b p-2 text-left text-sm last:border-b-0 hover:bg-muted" key={member.id} onClick={() => add(member.id)}>
        <span><span className="font-medium">{member.name}</span><span className="block text-xs text-muted-foreground">@{member.username || "no-username"} · {member.email}</span></span>
        <span className="ml-3 whitespace-nowrap">Add #{member.id}</span>
      </button>)}</div>}
    {search.trim().length >= 2 && !directory.isFetching && !results.length && <p className="text-xs text-muted-foreground">No available member matches this search.</p>}
    <div className="space-y-2"><p className="text-sm font-medium">Selected recipients ({parsed.ids.length}/{max})</p>
      {selected.length ? <div className="flex flex-wrap gap-2">{selected.map(member =>
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs" key={member.id}>{member.name} · #{member.id}<button type="button" aria-label={`Remove recipient ${member.id}`} disabled={disabled} onClick={() => remove(member.id)}>×</button></span>)}</div>
        : <p className="text-xs text-muted-foreground">{allowAll ? "No specific recipients selected. Publishing will target all active users." : "Search and select at least one member."}</p>}
    </div>
    <details><summary className="cursor-pointer text-xs text-muted-foreground">Advanced: enter member IDs</summary>
      <label className="mt-2 block text-sm">Member IDs (comma or space separated)<Input aria-label="Advanced recipient member IDs" value={value} disabled={disabled} onChange={event => onChange(event.target.value)} placeholder="70, 71" /></label>
    </details>
  </section>;
}
