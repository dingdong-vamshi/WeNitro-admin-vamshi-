import type { WorkspaceKind, WorkspacePayload } from "@/lib/admin-workspace";

export function parseRecipientIds(value: string) {
  const tokens = value.split(/[\s,]+/).filter(Boolean);
  const ids: number[] = [];
  const invalid: string[] = [];
  for (const token of tokens) {
    const id = Number(token);
    if (!/^\d+$/.test(token) || !Number.isSafeInteger(id) || id <= 0 || id > 999_999_999) {
      invalid.push(token);
    } else if (!ids.includes(id)) {
      ids.push(id);
    }
  }
  return { ids, invalid };
}

export function workspaceSaveIssue(input: {
  kind: WorkspaceKind;
  payload: WorkspacePayload;
  recipients: string;
  reason: string;
}) {
  const { kind, payload, recipients, reason } = input;
  if (payload.name.trim().length < 2) return "Enter a name with at least 2 characters.";
  if (["campaign", "notification_template", "email_template"].includes(kind)) {
    if (!payload.title.trim()) return "Enter a title or subject.";
    if (!payload.body.trim()) return "Enter a message.";
  }
  if (kind === "campaign") {
    const parsed = parseRecipientIds(recipients);
    if (parsed.invalid.length) return "Recipient IDs must be positive whole numbers.";
    if (!parsed.ids.length) return "Select at least one recipient.";
    if (parsed.ids.length > 500) return "Select no more than 500 recipients.";
  }
  if (reason.trim().length < 5) return "Explain the audit reason in at least 5 characters.";
  return "";
}
