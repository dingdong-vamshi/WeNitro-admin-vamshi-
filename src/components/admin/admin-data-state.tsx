"use client";

import { AlertCircle, Database, LoaderCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  title: string;
  loading?: boolean;
  error?: unknown;
  empty?: boolean;
  onRetry?: () => void;
};

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "The live WeNitro data could not be loaded.";
}

export function AdminDataState({ title, loading, error, empty, onRetry }: Props) {
  const Icon = loading ? LoaderCircle : error ? AlertCircle : Database;
  const description = loading
    ? `Loading ${title.toLowerCase()} from WeNitro...`
    : error
      ? errorMessage(error)
      : `No ${title.toLowerCase()} are available yet.`;

  if (!loading && !error && !empty) return null;

  return (
    <Card className="border-dashed">
      <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
          <Icon className={`h-5 w-5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </span>
        <div>
          <p className="font-medium">{loading ? `Loading ${title}` : error ? `Unable to load ${title}` : `No ${title}`}</p>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">{description}</p>
        </div>
        {error && onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Retry
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
