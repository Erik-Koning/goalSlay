"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { navigateToPath } from "@common/utils/DOM";
import { HREFLink } from "@common/components/ui/HREFLink";
import { removeDuplicates } from "@common/utils/objectManipulation";
import { useUIStore, type BannerMessage } from "@/lib/stores/uiStore";
import { Button } from "@common/components/ui/Button";
import { ChevronUp, ChevronDown, X } from "lucide-react";

interface NoticeBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface ActionableButtonMap {
  [key: string]: {
    url: string;
    action?: Record<string, string>;
    text: string;
  };
}

export const NoticeBanner = forwardRef<HTMLDivElement, NoticeBannerProps>(({ className, ...props }, ref) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(-1);
  const [currentBanner, setCurrentBanner] = useState<BannerMessage | null>({ title: "", message: "" });
  const [showActionButton, setShowActionButton] = useState(false); // Whether or not to show the action button

  const { bannerMessages, closedBannerTitles, bannerOpen, setBannerOpen, setClosedBannerTitles } = useUIStore();

  const router = useRouter();

  const actionableButtonMap: ActionableButtonMap = {
    trial: {
      url: "/settings?tab=billing",
      action: {
        navigate: "/settings?tab=billing",
      },
      text: "Select Plan",
    },
    profileSettings: {
      url: "/settings",
      action: {
        navigate: "/settings",
      },
      text: "Update Profile",
    },
  };

  const handleBannerClose = () => {
    setClosedBannerTitles(removeDuplicates([...closedBannerTitles, currentBanner ? currentBanner.title : undefined]) as string[]); // Add the current banner title to the list of closed banners
    if (bannerMessages.length === 1) {
      setBannerOpen(false);
    }
  };

  const handleCloseBannerClick = (e: React.MouseEvent, delay: number = 0) => {
    const timestamp = new Date().getTime(); // Current timestamp in milliseconds
    if (!currentBanner) return;
    localStorage.setItem(currentBanner.title + "_bannerClosedTimestamp", timestamp.toString());
    setTimeout(() => {
      handleBannerClose();
    }, delay);
  };

  useEffect(() => {
    if (bannerMessages.length === 0) return;
    console.log("bannerMessages", bannerMessages);
    // Find the index of the first banner that has not been closed
    const unClosedBannerIndex = bannerMessages.findIndex((message) => !closedBannerTitles.includes(message.title));

    // If there is an unclosed banner, set it as the current banner
    if (unClosedBannerIndex !== -1) {
      console.log("unClosedBannerIndex", unClosedBannerIndex);
      setCurrentBannerIndex(unClosedBannerIndex);
      setBannerOpen(true);
    }
    // If there are no unclosed banners, close the banner
    else {
      setBannerOpen(false);
    }
  }, [bannerMessages, closedBannerTitles, setBannerOpen]);

  useEffect(() => {
    if (bannerOpen) {
      if (closedBannerTitles.length > 0) {
        setClosedBannerTitles([]);
      }
    }
  }, [bannerOpen, closedBannerTitles.length, setClosedBannerTitles]);

  const scrollUp = () => {
    if (currentBannerIndex > 0) {
      setCurrentBannerIndex(currentBannerIndex - 1);
    }
  };

  const scrollDown = () => {
    if (currentBannerIndex < bannerMessages.length - 1) {
      setCurrentBannerIndex(currentBannerIndex + 1);
    }
  };

  const isActionable = (title: string): boolean => {
    if (title in actionableButtonMap) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (currentBannerIndex < bannerMessages.length && currentBannerIndex >= 0) {
      const currentBannerMsg = bannerMessages[currentBannerIndex];
      console.log("currentBanner", currentBannerMsg);
      setCurrentBanner(currentBannerMsg);

      if (isActionable(currentBannerMsg.title) || currentBannerMsg.buttonAction) {
        setShowActionButton(true);
      } else {
        setShowActionButton(false);
      }
    }
  }, [currentBannerIndex, bannerMessages]);

  const numberOfOpenBannerMessages = () => {
    return bannerMessages.length - closedBannerTitles.length;
  };

  const runAction = (action: Record<string, string>) => {
    for (const [key, value] of Object.entries(action)) {
      if (key === "navigate") {
        navigateToPath(router, value);
      }
    }
  };

  return (
    <div
      //TODO make the conditional set via styles so it animates correctly
      className={cn("fixed left-0 right-0 top-0 z-30 flex h-banner-height items-center justify-center gap-x-2 bg-skyBlue p-4 text-white transition-all", {
        "h-0 overflow-hidden p-0": !bannerOpen,
      })}
      {...props}
    >
      {currentBanner && (
        <>
          {numberOfOpenBannerMessages() > 1 && currentBannerIndex > 0 && (
            <Button onClick={scrollUp} variant="ghost" size="tight" className="p-1 text-white hover:text-black">
              <ChevronUp size={24} />
            </Button>
          )}
          {numberOfOpenBannerMessages() > 1 && currentBannerIndex < bannerMessages.length - 1 && (
            <Button onClick={scrollDown} variant="ghost" size="tight" className="p-1 text-white hover:text-black">
              <ChevronDown size={24} />
            </Button>
          )}
          <span className="text-sm font-normal">{currentBanner.message}</span>
          {showActionButton && (actionableButtonMap[currentBanner.title] || currentBanner.buttonAction) && (
            <Button
              variant="purple"
              size="tight"
              className="p-1 px-2 text-sm text-white"
              onClick={(e: any) => {
                const action = actionableButtonMap[currentBanner.title]?.action ?? currentBanner.buttonAction;
                if (action) {
                  e.preventDefault(); // Prevent the default action, ie navigating to the url
                  e.stopPropagation(); // Prevent the event from bubbling up the DOM tree
                  runAction(action);
                }
                handleCloseBannerClick(e, 1500);
              }}
            >
              <HREFLink url={actionableButtonMap[currentBanner.title]?.url ?? currentBanner.buttonUrl} className="border-none p-0 text-white">
                {actionableButtonMap[currentBanner.title]?.text ?? currentBanner?.buttonTitle ?? undefined}
              </HREFLink>
            </Button>
          )}
          {currentBanner.dismissible && (
            <Button variant="ghost" size="tight" onClick={handleCloseBannerClick} className="p-1.5 text-white hover:text-black">
              <X size={18} />
            </Button>
          )}
        </>
      )}
    </div>
  );
});

NoticeBanner.displayName = "NoticeBanner";
