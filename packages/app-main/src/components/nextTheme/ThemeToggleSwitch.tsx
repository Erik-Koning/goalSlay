"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Icons } from "@common/components/ui/Icons";
import { Switch } from "@common/components/ui/switch";
import { cn } from "@/lib/utils";
import { LabelAbove } from "@common/components/ui/LabelAbove";

export function ThemeToggleSwitch({
  expanded,
  className,
  themeToggleRef,
}: {
  themeToggleRef?: React.LegacyRef<HTMLDivElement>;
  expanded?: boolean;
  className?: string;
}) {
  const { setTheme, theme } = useTheme();

  const ToggleTheme = () => {
    console.log("theme", theme);
    if (theme === "light") {
      setTheme("dark");
    }
    if (theme === "dark") {
      setTheme("light");
    }
  };

  return (
    <div ref={themeToggleRef} className={cn("flex flex-col gap-y-[3px]", className)}>
      <LabelAbove
        className="flex gap-x-2"
        label={
          <div className="flex gap-x-1">
            <h2>{theme === "dark" ? "Dark Mode" : "Light Mode"}</h2>
          </div>
        }
      >
        <Switch defaultChecked={theme === "dark"} onCheckedChange={ToggleTheme} className="hover:bg-red-500" />
        <div className="flex items-center gap-x-5 rounded-md text-primary-dark">
          <Icons.Sun className="rotate-0 scale-[78%] transition-transform dark:-rotate-90 dark:scale-0" />
          <Icons.Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-[260deg] dark:scale-[78%] " />
        </div>
      </LabelAbove>
    </div>
  );
}
