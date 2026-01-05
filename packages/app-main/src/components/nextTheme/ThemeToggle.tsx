"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Icons } from "@common/components/ui/Icons";
import { Button } from "@common/components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/DropdownMenu";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = React.forwardRef<HTMLDivElement, ThemeToggleProps>(({ className }, ref) => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          //size="blank"
          size="fit"
          className={cn("flex h-fit w-fit items-center justify-center bg-background-light p-2", className)}
        >
          <Icons.Sun className="absolute h-6 w-6 rotate-0 scale-110 transition-all hover:text-slate-900 dark:-rotate-90 dark:scale-0 dark:text-slate-400 dark:hover:text-slate-100" />
          <Icons.Moon className="rotate-90 scale-0 transition-all hover:text-slate-900 dark:rotate-0 dark:scale-100 dark:text-slate-400 dark:hover:text-slate-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Icons.Sun className="mr-2 h-[19px] w-[19px]" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Icons.Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Icons.Laptop className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

ThemeToggle.displayName = "ThemeToggle";
