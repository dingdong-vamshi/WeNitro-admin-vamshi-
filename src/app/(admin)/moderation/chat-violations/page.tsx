import { ChatViolationsTable } from "@/components/admin/chat-violations-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatViolationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Chat Violations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Messages flagged for offensive language, spam links, harassment, and other violations in event chats.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flagged Messages</CardTitle>
          <CardDescription>Click a row to expand the full message preview. Take action or dismiss each flag.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChatViolationsTable />
        </CardContent>
      </Card>
    </div>
  );
}
