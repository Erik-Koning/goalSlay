// components/providers.tsx
"use client"; // This is the client boundary

import { ThemeProvider } from "@/src/components/providers/theme-provider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast:
              "bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-white/30 dark:border-slate-700/30 shadow-lg",
            title: "text-foreground font-medium",
            description: "text-muted-foreground text-sm",
            error:
              "bg-red-50/90 dark:bg-red-950/90 border-red-200/50 dark:border-red-800/50",
            success:
              "bg-green-50/90 dark:bg-green-950/90 border-green-200/50 dark:border-green-800/50",
            warning:
              "bg-yellow-50/90 dark:bg-yellow-950/90 border-yellow-200/50 dark:border-yellow-800/50",
            info: "bg-blue-50/90 dark:bg-blue-950/90 border-blue-200/50 dark:border-blue-800/50",
          },
        }}
        richColors
        closeButton
      />
    </ThemeProvider>
  );
}
