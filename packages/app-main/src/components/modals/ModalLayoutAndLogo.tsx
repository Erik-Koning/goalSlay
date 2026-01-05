import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ModalLayout, ModalLayoutProps } from "../../../../common/src/components/modals/ModalLayout";
import { ThemedLogo } from "@/src/components/nextTheme/ThemedLogo";

interface ModalLayoutAndLogoProps extends ModalLayoutProps {
  logo?: boolean | "light" | "dark";
}

export const ModalLayoutAndLogo = forwardRef<HTMLDivElement, ModalLayoutAndLogoProps>(({ logo, ...props }, ref) => {
  return (
    <ModalLayout
      {...props}
      ref={ref}
      logo={<ThemedLogo force={typeof logo === "string" ? logo : "dark"} width={290} className="flex h-auto max-w-full p-1" />}
    />
  );
});

ModalLayoutAndLogo.displayName = "ModalLayoutAndLogo";
