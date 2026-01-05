"use client";

import { forwardRef } from "react";
import { PageContentContainer as CommonPageContentContainer, PageContentContainerProps } from "@common/components/ui/PageContentContainer";
import { useUIStore } from "@/lib/stores/uiStore";

export const PageContentContainer = forwardRef<HTMLDivElement, PageContentContainerProps>(({ ...props }, ref) => {
  const { sideMenuOpen, bannerOpen } = useUIStore();
  
  return (
    <CommonPageContentContainer 
      {...props} 
      UIState={{ sideMenuOpen, bannerOpen }} 
      ref={ref} 
    />
  );
});

PageContentContainer.displayName = "PageContentContainer";
