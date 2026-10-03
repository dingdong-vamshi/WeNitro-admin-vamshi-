import { supabase } from "@/lib/supabase";

export type AuthIpObservation = {
  id: string;
  occurredAt: string | null;
  ipAddress: string;
  action: string | null;
  actorUserId: number | null;
};
export type AuthIpObservations = {
  items: AuthIpObservation[];
  candidateCount: number;
  matchingCount: number;
  candidateLimit: number;
  resultLimit: number;
};

export async function getAuthIpObservations(search = "", signal?: AbortSignal): Promise<AuthIpObservations> {
  const query = search.trim();
  if (query.length > 64) throw new Error("Search must contain at most 64 characters.");
  const request = supabase.rpc("admin_auth_ip_observations", { p_search: query });
  const result = await (signal ? request.abortSignal(signal) : request);
  if (result.error) throw new Error(`Unable to load Auth IP observations: ${result.error.message}`);
  if (!result.data || !Array.isArray(result.data.items)) throw new Error("Auth IP observations returned an invalid response.");
  return result.data as AuthIpObservations;
}
