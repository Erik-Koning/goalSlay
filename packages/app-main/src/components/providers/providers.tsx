// components/providers.tsx
"use client"; // This is the client boundary

import { ThemeProvider } from "@/src/components/providers/theme-provider";
// import { AuthProvider } from "./auth-provider"; 

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      {/* Any other providers go here */}
      {children} 
    </ThemeProvider>
  );
}