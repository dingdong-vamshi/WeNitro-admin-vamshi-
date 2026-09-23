import { supabase } from "@/lib/supabase";
import type {
  AdminAppRole,
  PartnerApplication,
  PartnerApplicationHistoryEntry,
  PartnerApplicationStatus,
  PartnerFinanceConfig,
  PartnerFinanceRow,
  PartnerPayoutReviewStatus,
  PartnerSettlementStatus,
} from "@/types/admin";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function nullableText(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function applicationStatus(value: unknown): PartnerApplicationStatus {
  const candidate = text(value).toUpperCase();
  return ["DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED", "SUSPENDED"].includes(candidate)
    ? (candidate as PartnerApplicationStatus)
    : "DRAFT";
}

function payoutStatus(value: unknown): PartnerPayoutReviewStatus {
  const candidate = text(value).toUpperCase();
  return ["UNDER_REVIEW", "APPROVED", "REJECTED", "ON_HOLD"].includes(candidate)
    ? (candidate as PartnerPayoutReviewStatus)
    : "UNDER_REVIEW";
}

function settlementStatus(value: unknown): PartnerSettlementStatus {
  const candidate = text(value).toUpperCase();
  return ["PENDING", "PROCESSING", "PAID", "FAILED", "ON_HOLD"].includes(candidate)
    ? (candidate as PartnerSettlementStatus)
    : "PENDING";
}

function parseApplication(value: unknown): PartnerApplication {
  const row = record(value);
  const user = record(row.user);
  const payout = row.payout_account === null || row.payout_account === undefined
    ? null
    : record(row.payout_account);

  return {
    userId: numberValue(row.user_id),
    businessName: text(row.business_name, "Unnamed business"),
    description: text(row.description),
    city: text(row.city, "Not provided"),
    activityTypes: stringList(row.activity_types),
    activityLocation: text(row.activity_location, "Not provided"),
    ageCategory: text(row.age_category, "Not provided"),
    status: applicationStatus(row.status),
    submittedAt: nullableText(row.submitted_at),
    reviewedAt: nullableText(row.reviewed_at),
    decisionReason: nullableText(row.decision_reason),
    applicant: {
      fullName: text(user.fullname, "Unnamed applicant"),
      username: text(user.username),
      email: text(user.email),
      phone: text(user.phone_e164),
    },
    payoutAccount: payout
      ? {
          bankName: text(payout.bank_name),
          accountHolderName: text(payout.account_holder_name),
          accountNumberMasked: text(payout.account_number_masked),
          ifscMasked: text(payout.ifsc_masked),
          upiIdMasked: text(payout.upi_id_masked),
          reviewStatus: payoutStatus(payout.review_status),
          reviewReason: nullableText(payout.review_reason),
        }
      : null,
  };
}

function parseFinanceRow(value: unknown): PartnerFinanceRow {
  const row = record(value);
  return {
    settlementId: numberValue(row.settlement_id),
    eventId: numberValue(row.event_id),
    activityTitle: text(row.activity_title, `Activity ${numberValue(row.event_id)}`),
    partnerUserId: numberValue(row.partner_user_id),
    partnerName: text(row.partner_name, "Unnamed partner"),
    businessName: text(row.business_name, "Unnamed business"),
    status: settlementStatus(row.status),
    grossPaisa: numberValue(row.gross_paisa),
    platformFeePaisa: numberValue(row.platform_fee_paisa),
    gstPaisa: numberValue(row.gst_paisa),
    refundPaisa: numberValue(row.refund_paisa),
    expectedNetPaisa: numberValue(row.expected_net_paisa),
    eligibleAt: nullableText(row.eligible_at),
    dueAt: nullableText(row.due_at),
    paidAt: nullableText(row.paid_at),
    payoutReference: nullableText(row.payout_reference),
    note: nullableText(row.note),
  };
}

function throwIfError(context: string, error: { message: string; code?: string } | null) {
  if (error) throw new Error(`${context}: ${error.message}${error.code ? ` (${error.code})` : ""}`);
}

export async function getCurrentAdminRole(): Promise<AdminAppRole> {
  const result = await supabase.auth.getUser();
  if (result.error) throw new Error(`Unable to verify administrator role: ${result.error.message}`);
  const role = result.data.user?.app_metadata?.role;
  return role === "admin" || role === "super_admin" || role === "finance_admin" ? role : null;
}

export async function listPartnerApplications(status?: PartnerApplicationStatus | "all") {
  const result = await supabase.rpc("admin_list_partner_applications", {
    p_status: status && status !== "all" ? status : null,
  });
  throwIfError("Unable to load Partner applications", result.error);
  return (Array.isArray(result.data) ? result.data : []).map(parseApplication);
}

export async function searchPartnerApplications(filters: {
  status?: PartnerApplicationStatus | "all";
  city?: string;
  category?: string;
  submittedFrom?: string;
  submittedTo?: string;
}) {
  const result = await supabase.rpc("admin_search_partner_applications", {
    p_status: filters.status && filters.status !== "all" ? filters.status : null,
    p_city: filters.city && filters.city !== "all" ? filters.city : null,
    p_category: filters.category && filters.category !== "all" ? filters.category : null,
    p_submitted_from: filters.submittedFrom || null,
    p_submitted_to: filters.submittedTo || null,
  });
  throwIfError("Unable to search Partner applications", result.error);
  return (Array.isArray(result.data) ? result.data : []).map(parseApplication);
}

export async function getPartnerApplication(userId: number) {
  const applications = await listPartnerApplications("all");
  return applications.find((application) => application.userId === userId) ?? null;
}

export async function listPartnerApplicationHistory(userId: number): Promise<PartnerApplicationHistoryEntry[]> {
  const result = await supabase.rpc("admin_list_partner_application_history", {
    p_user_id: userId,
  });
  throwIfError("Unable to load Partner review history", result.error);
  return (result.data ?? []).map((value: unknown) => {
    const row = record(value);
    return {
      id: text(row.id),
      userId: numberValue(row.user_id),
      fromStatus: row.from_status === null ? null : applicationStatus(row.from_status),
      toStatus: applicationStatus(row.to_status),
      reason: nullableText(row.reason),
      actorUserId: row.actor_user_id === null ? null : numberValue(row.actor_user_id),
      createdAt: text(row.created_at),
    };
  });
}

export async function reviewPartnerApplication(input: {
  userId: number;
  status: Exclude<PartnerApplicationStatus, "DRAFT">;
  reason?: string;
}) {
  const result = await supabase.rpc("admin_review_partner_application", {
    p_user_id: input.userId,
    p_status: input.status,
    p_reason: input.reason?.trim() || null,
  });
  throwIfError("Unable to update Partner application", result.error);
  return result.data;
}

export async function listPartnerFinance(status?: PartnerSettlementStatus | "all") {
  const result = await supabase.rpc("admin_list_partner_finance", {
    p_status: status && status !== "all" ? status : null,
  });
  throwIfError("Unable to load Partner financial ledger", result.error);
  return (Array.isArray(result.data) ? result.data : []).map(parseFinanceRow);
}

export async function getPartnerFinanceConfig(): Promise<PartnerFinanceConfig> {
  const result = await supabase.rpc("admin_get_partner_finance_config");
  throwIfError("Unable to load Partner finance policy", result.error);
  const row = record(result.data);
  return {
    platformFeeBps: numberValue(row.platform_fee_bps),
    gstEnabled: row.gst_enabled === true,
    gstBps: numberValue(row.gst_bps),
    gstBasis: ["gross", "platform_fee"].includes(text(row.gst_basis))
      ? (text(row.gst_basis) as "gross" | "platform_fee")
      : "disabled",
    settlementDays: numberValue(row.settlement_days),
    updatedAt: nullableText(row.updated_at),
  };
}

export async function updatePartnerFinanceConfig(input: {
  platformFeeBps: number;
  gstEnabled: boolean;
  gstBps: number;
  gstBasis: PartnerFinanceConfig["gstBasis"];
  settlementDays: number;
  reason: string;
}): Promise<PartnerFinanceConfig> {
  const result = await supabase.rpc("admin_update_partner_finance_config", {
    p_platform_fee_bps: input.platformFeeBps,
    p_gst_enabled: input.gstEnabled,
    p_gst_bps: input.gstEnabled ? input.gstBps : 0,
    p_gst_basis: input.gstEnabled ? input.gstBasis : "disabled",
    p_settlement_days: input.settlementDays,
    p_reason: input.reason.trim(),
  });
  throwIfError("Unable to update Partner finance policy", result.error);
  const row = record(result.data);
  return {
    platformFeeBps: numberValue(row.platform_fee_bps),
    gstEnabled: row.gst_enabled === true,
    gstBps: numberValue(row.gst_bps),
    gstBasis: ["gross", "platform_fee"].includes(text(row.gst_basis))
      ? (text(row.gst_basis) as "gross" | "platform_fee")
      : "disabled",
    settlementDays: numberValue(row.settlement_days),
    updatedAt: nullableText(row.updated_at),
  };
}

export async function updatePartnerSettlement(input: {
  settlementId: number;
  status: PartnerSettlementStatus;
  payoutReference?: string;
  note?: string;
}) {
  const result = await supabase.rpc("admin_update_partner_settlement", {
    p_settlement_id: input.settlementId,
    p_status: input.status,
    p_payout_reference: input.payoutReference?.trim() || null,
    p_note: input.note?.trim() || null,
  });
  throwIfError("Unable to update Partner settlement", result.error);
  return parseFinanceRow({ ...record(result.data), settlement_id: input.settlementId });
}

export async function recordPartnerFinancialEvent(input: {
  paymentId: number;
  kind: "REFUND" | "CHARGEBACK" | "DISPUTE" | "REVERSAL" | "ADJUSTMENT";
  status: "REQUIRED" | "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "OPEN" | "RESOLVED";
  amountPaisa: number;
  providerReference?: string;
  idempotencyKey: string;
  reason: string;
}) {
  const result = await supabase.rpc("admin_record_partner_financial_event", {
    p_payment_id: input.paymentId,
    p_kind: input.kind,
    p_status: input.status,
    p_amount_paisa: input.amountPaisa,
    p_provider_reference: input.providerReference?.trim() || null,
    p_idempotency_key: input.idempotencyKey.trim(),
    p_reason: input.reason.trim(),
    p_metadata: {},
  });
  throwIfError("Unable to record Partner financial event", result.error);
  return result.data;
}
