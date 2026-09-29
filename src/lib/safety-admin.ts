import { supabase } from "@/lib/supabase";

export type AnonymousCommunityPostAudit = {
  id: number;
  roomId: number;
  communityName: string;
  userId: number;
  username: string;
  fullName: string | null;
  title: string | null;
  body: string;
  mediaType: string | null;
  createdAt: string;
};

export async function listAnonymousCommunityPosts(): Promise<AnonymousCommunityPostAudit[]> {
  const { data, error } = await supabase.rpc("admin_list_anonymous_community_posts", {
    p_limit: 100,
    p_before_id: null,
  });
  if (error) throw new Error(`Unable to load anonymous post audit: ${error.message}`);
  return (Array.isArray(data) ? data : []).map((value: Record<string, unknown>) => ({
    id: Number(value.id),
    roomId: Number(value.room_id),
    communityName: String(value.community_name || `Community ${value.room_id}`),
    userId: Number(value.user_id),
    username: String(value.username || "member"),
    fullName: value.fullname == null ? null : String(value.fullname),
    title: value.title == null ? null : String(value.title),
    body: String(value.body || ""),
    mediaType: value.media_type == null ? null : String(value.media_type),
    createdAt: String(value.created_at),
  }));
}
