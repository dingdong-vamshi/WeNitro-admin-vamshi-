"use client";

import { useQuery } from "@tanstack/react-query";

import { AdminDataState } from "@/components/admin/admin-data-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAnonymousCommunityPosts } from "@/lib/safety-admin";

export function AnonymousCommunityPosts() {
  const query = useQuery({ queryKey: ["anonymous-community-posts"], queryFn: listAnonymousCommunityPosts });
  if (query.isLoading) return <AdminDataState title="Anonymous Community Posts" loading />;
  if (query.error || !query.data) return <AdminDataState title="Anonymous Community Posts" error={query.error} onRetry={() => void query.refetch()} />;
  return <Card><CardHeader><CardTitle>Anonymous Community Posts</CardTitle><CardDescription>Members see “Anonymous”; authenticated WeNitro Admins retain author identity for safety investigations.</CardDescription></CardHeader><CardContent className="overflow-x-auto p-0">{query.data.length ? <Table><TableHeader><TableRow><TableHead>Post</TableHead><TableHead>Community</TableHead><TableHead>Author identity</TableHead><TableHead>Content</TableHead><TableHead>Created</TableHead></TableRow></TableHeader><TableBody>{query.data.map(post => <TableRow key={post.id}><TableCell className="font-mono text-xs">{post.id}</TableCell><TableCell>{post.communityName}<p className="text-xs text-muted-foreground">Room {post.roomId}</p></TableCell><TableCell><p className="font-medium">{post.fullName || post.username}</p><p className="text-xs text-muted-foreground">@{post.username} · User {post.userId}</p></TableCell><TableCell><p className="max-w-md font-medium">{post.title || "Untitled post"}</p><p className="max-w-md truncate text-xs text-muted-foreground">{post.body || post.mediaType || "Media post"}</p></TableCell><TableCell>{new Date(post.createdAt).toLocaleString("en-IN")}</TableCell></TableRow>)}</TableBody></Table> : <div className="p-8 text-center text-sm text-muted-foreground">No active anonymous Community posts.</div>}</CardContent></Card>;
}
