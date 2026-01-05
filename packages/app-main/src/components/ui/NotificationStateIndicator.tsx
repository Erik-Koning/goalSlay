import { useEffect, useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@common/components/ui/hover-card";
import { DropdownMenu, DropdownMenuGroup, DropdownMenuItem } from "@common/components/ui/DropdownMenu";
import { DropdownMenuContent, DropdownMenuTrigger } from "@common/components/ui/DropdownMenu";
import { cn } from "@/lib/utils";
import { Button } from "@common/components/ui/Button";
import NotificationDot from "@common/components/ui/NotificationDot";
import { useUIStore } from "@/lib/stores/uiStore";
import { Bell, Flag } from "lucide-react";

export const NotificationStateIndicator = () => {
  const {
    modalMessages,
    bannerMessages,
    closedBannerTitles,
    modalOpen,
    notificationPriority,
    setBannerOpen,
    setNotificationSheetOpen,
  } = useUIStore();
  const [hideHoverCard, setHideHoverCard] = useState(false);
  const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);

  const [isShaking, setIsShaking] = useState(false);

  const getNotificationCount = (): 0 | 1 | 2 => {
    //are there any modal messages?
    const hasModalMessages = modalMessages.length > 0;
    //are there any banner messages that are not currently shown?
    const hasBannerMessages = bannerMessages.length > 0 && closedBannerTitles.length > 0;

    //returns 0 for no notifications, 1 for some normal notifications, 2 for some urgent notifications
    return hasModalMessages || hasBannerMessages ? (notificationPriority >= 2 ? 2 : 1) : 0;
  };

  useEffect(() => {
    // Shake effect every 5 seconds when notficationState is 2 (urgent)
    if (notificationPriority === 2) {
      const interval = setInterval(() => {
        setIsShaking((prevIsShaking) => !prevIsShaking);
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setIsShaking(false);
    }
  }, [notificationPriority]);

  const renderIcon = () => {
    const switchNumber = getNotificationCount();

    switch (switchNumber) {
      case 0:
        //No Notifications
        return <Bell className="h-6 w-6 text-tertiary-dark" />;
      case 1:
        //Some Normal Notifications
        return <Bell className="h-6 w-6 text-secondary-dark" />;
      case 2:
        //Urgent Notifications
        return <Bell className="h-6 w-6 text-secondary-dark" />;
    }
  };

  const getStatusBasedOnCloudState = () => {
    const switchNumber = getNotificationCount();

    switch (switchNumber) {
      case 0:
        return <span className="text-gray-400"></span>;
      case 1:
        return <span className="text-gray-400"></span>;
      case 2:
        return <span className="text-gray-400"></span>;
    }
  };

  const getTitleBasedOnCloudState = () => {
    const switchNumber = getNotificationCount();

    switch (switchNumber) {
      case 0:
        return <div className="text-gray-500">No Notifications</div>;
      case 1:
        return <div className="text-green">Some Notices</div>;
      case 2:
        return <div className="text-purple">Some Urgent Notifications</div>;
    }
  };

  const getSubTitleBasedOnCloudState = () => {
    const switchNumber = getNotificationCount();

    switch (switchNumber) {
      case 0:
        return <span className="text-gray-400"></span>;
      case 1:
        return <span className="text-gray-400"></span>;
      case 2:
        return <span className="text-gray-400"></span>;
    }
  };

  const getNumberOfNotifications = () => {
    //The total number of notifications not actively shown to user
    const numModalMessages = modalMessages.length - (modalOpen ? 1 : 0); //Dont show number for one that is currently open for user
    const numBannerMessages = closedBannerTitles.length; //hidden banners
    return numModalMessages + numBannerMessages;
  };

  const handleShowBannerNotices = () => {
    setBannerOpen(true);
  };

  const handleNotificationClick = () => {
    setNotificationSheetOpen(true);
  };

  return (
    <div
      onMouseEnter={() => {
        setHideHoverCard(false);
      }}
    >
      <DropdownMenu open={dropdownMenuOpen}>
        <HoverCard openDelay={800} open={hideHoverCard ? false : undefined}>
          <HoverCardTrigger asChild>
            <DropdownMenuTrigger className={cn("")} asChild>
              <Button variant="ghost" className="flex justify-end gap-x-4" onClick={handleNotificationClick} asChild>
                <div className="hidden text-base font-normal md:block [@media(min-width:560px)]:block">{getStatusBasedOnCloudState()}</div>
                <div className="relative text-[27px]">
                  {renderIcon()}
                  <NotificationDot numberOfNotifications={getNumberOfNotifications()} hideDotIfZero={true} />
                </div>
              </Button>
            </DropdownMenuTrigger>
          </HoverCardTrigger>
          <HoverCardContent className="w-fit max-w-[350px]">
            <div className="space-y-1">
              <h4 className="text-md font-medium">{getTitleBasedOnCloudState()}</h4>
              <div className="text-sm font-normal">{getSubTitleBasedOnCloudState()}</div>
            </div>
          </HoverCardContent>
          <DropdownMenuContent className="w-56 rounded-lg bg-primary-light shadow-md">
            <DropdownMenuGroup>
              {bannerMessages.length > 0 && closedBannerTitles.length > 0 && (
                <DropdownMenuItem onClick={handleShowBannerNotices}>
                  <Flag className="mr-2 h-4 w-4" />
                  <span>Show Banner Notices</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </HoverCard>
      </DropdownMenu>
    </div>
  );
};
