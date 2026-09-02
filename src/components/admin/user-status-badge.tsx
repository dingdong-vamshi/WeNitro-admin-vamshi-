import type { UserStatus } from "@/types/admin";
import { Badge } from "@/components/ui/badge";

const statusVariant: Record<UserStatus, "success" | "info" | "caution" | "warning" | "danger"> = {
  active: "success",
  verified: "info",
  blocked: "caution",
  suspended: "warning",
  banned: "danger",
};

const statusLabel: Record<UserStatus, string> = {
  active: "Active",
  verified: "Verified",
  blocked: "Blocked",
  suspended: "Suspended",
  banned: "Banned",
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>;
}
