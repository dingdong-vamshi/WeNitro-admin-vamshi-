import { ChatViolationsTable } from "@/components/admin/chat-violations-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatViolationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Chat Violations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review member reports mentioning chat, messages, harassment or spam.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chat-related member reports</CardTitle>
          <CardDescription>Review submitted evidence and record an investigating, resolved or dismissed decision.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChatViolationsTable />
        </CardContent>
      </Card>
    </div>
  );
}
