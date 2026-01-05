"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Icons } from "@common/components/ui/Icons";

export function ThemeToggleButton({
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
    //console.log("theme", theme);
    if (theme === "light") {
      setTheme("dark");
    }
    if (theme === "dark") {
      setTheme("light");
    }
  };

  return (
    <div ref={themeToggleRef} onClick={ToggleTheme} className={`${className}`}>
      <div className="flex h-min cursor-pointer items-center gap-x-5 rounded-md pr-[4px] hover:bg-purple ">
        <Icons.Moon className="rotate-0 scale-[130%] transition-transform dark:-rotate-90 dark:scale-0" />
        <Icons.Sun className="absolute rotate-90 scale-0 transition-all dark:rotate-[260deg] dark:scale-[120%] " />
        <span className="sr-only">Toggle theme</span>
        {expanded &&
          (theme == "dark" ? (
            <div className="flex items-center text-lg font-semibold">Light Mode</div>
          ) : (
            <div className="flex items-center text-lg font-semibold">Dark Mode</div>
          ))}
      </div>
    </div>
  );
}
