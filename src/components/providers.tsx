"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Theme } from "@radix-ui/themes";

import { TooltipProvider } from "@/components/ui/tooltip";

// Must be a child of ThemeProvider so useTheme() resolves correctly
function RadixThemeSync({ children }: { children: React.ReactNode }) {
  return (
    <Theme
      appearance="light"
      accentColor="violet"
      grayColor="slate"
      radius="medium"
      hasBackground={false}
    >
      {children}
    </Theme>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
      <RadixThemeSync>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </QueryClientProvider>
      </RadixThemeSync>
    </ThemeProvider>
  );
}
