"use client";

import { useUIStore } from "@/lib/stores/uiStore";
import { useUserStore } from "@/lib/stores/userStore";
import { TooltipWrapper } from "@common/components/ui/TooltipWrapper";
import { cn } from "@/lib/utils";
import { BarChart3, Bike, ChevronLeft, ChevronRight, HelpCircle, LogOut, Map, Route, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

interface SideMenuProps {
  isFixed?: boolean;
  allowCollapse?: boolean;
  allowHide?: boolean;
}

const SideMenu: React.FC<SideMenuProps> = ({ 
  isFixed = true, 
  allowCollapse = true,
  allowHide = true 
}) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [edgeHovered, setEdgeHovered] = useState(false);
  const [isPermanentlyHidden, setIsPermanentlyHidden] = useState(allowHide);

  const { sideMenuOpen, bannerOpen, setSideMenuOpen } = useUIStore();
  const { user, signOut, fetchUser, isLoading } = useUserStore();

  useEffect(() => {
    setMounted(true);
    fetchUser();
  }, [fetchUser]);

  const iconSize = 22;

  const mainNavItems: NavItem[] = [
    { href: "/dashboard", icon: <BarChart3 size={iconSize} />, label: "Analytics" },
    { href: "/vehicles", icon: <Bike size={iconSize} />, label: "Vehicles" },
    { href: "/map", icon: <Map size={iconSize} />, label: "Map" },
    { href: "/trips", icon: <Route size={iconSize} />, label: "Trips" },
    { href: "/users", icon: <Users size={iconSize} />, label: "Users" },
  ];

  const bottomNavItems: NavItem[] = [
    { href: "/support", icon: <HelpCircle size={iconSize} />, label: "Support" },
    { href: "/settings", icon: <Settings size={iconSize} />, label: "Settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const NavLink = ({ item }: { item: NavItem }) => (
    <TooltipWrapper tooltipText={item.label} side="right" sideOffset={10} disabled={sideMenuOpen || isPermanentlyHidden} classNameChildren="w-full">
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer",
          "hover:bg-emerald-500/10 text-slate-200 hover:text-green-300",
          isActive(item.href) && "bg-emerald-700/25 text-green-400 hover:bg-emerald-800/40",
          (!sideMenuOpen || isPermanentlyHidden) && "justify-center"
        )}
      >
        <span className="shrink-0">{item.icon}</span>
        {sideMenuOpen && !isPermanentlyHidden && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
      </Link>
    </TooltipWrapper>
  );

  const handleSignOut = async () => {
    await signOut();
  };

  if (!mounted) return null;

  return (
    <>
      {/* Trigger area when hidden - 20px strip from left edge */}
      {isPermanentlyHidden && (
        <div
          className="fixed left-0 top-0 h-full z-[100]"
          style={{ width: "20px" }}
          onMouseEnter={() => setEdgeHovered(true)}
          onMouseLeave={() => setEdgeHovered(false)}
        />
      )}

      <aside
        className={cn(
          isFixed ? "fixed" : "absolute",
          "left-0 z-45 flex flex-col bg-charcoalBlue border-r border-charcoalLight transition-all duration-300",
          bannerOpen ? "top-[112px] h-[calc(100vh-112px)]" : "h-full",
          isPermanentlyHidden ? "w-0" : (sideMenuOpen ? "w-56" : "w-16"),
          isPermanentlyHidden && "border-r-0"
        )}
      >
        {/* Main Navigation */}
        <nav className={cn("flex-1 p-2 space-y-1 overflow-y-auto", isPermanentlyHidden && "hidden")}>
          {mainNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {/* Divider */}
        {!isPermanentlyHidden && <div className="mx-3 border-t border-slate-800" />}

        {/* Bottom Navigation */}
        <nav className={cn("p-2 space-y-1", isPermanentlyHidden && "hidden")}>
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}

          {/* Sign Out */}
          <TooltipWrapper tooltipText="Sign Out" side="right" sideOffset={10} disabled={sideMenuOpen || isPermanentlyHidden} classNameChildren="w-full">
            <button
              onClick={handleSignOut}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full cursor-pointer",
                "hover:bg-red-500/20 text-slate-300 hover:text-red-400",
                (!sideMenuOpen || isPermanentlyHidden) && "justify-center"
              )}
            >
              <LogOut size={iconSize} />
              {sideMenuOpen && !isPermanentlyHidden && <span className="text-sm font-medium whitespace-nowrap">Sign Out</span>}
            </button>
          </TooltipWrapper>
        </nav>

        {/* Divider */}
        {!isPermanentlyHidden && <div className="mx-3 border-t border-slate-800" />}

        {/* User Profile */}
        {!isPermanentlyHidden && (
          <div className="p-3">
            <TooltipWrapper tooltipText="User Profile" side="right" sideOffset={10} disabled={sideMenuOpen} classNameChildren="w-full">
              <div className={cn("flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 cursor-pointer", !sideMenuOpen && "justify-center")}>
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                {sideMenuOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{isLoading ? "Loading..." : user?.name || "User"}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email || ""}</p>
                  </div>
                )}
              </div>
            </TooltipWrapper>
          </div>
        )}

        {/* Control Button (Arrow) */}
        <TooltipWrapper
          classNameChildren={cn(
            "absolute top-1/2 z-[110] transition-all duration-300",
            isPermanentlyHidden 
              ? (edgeHovered ? "left-0 translate-x-5 -translate-y-1/2" : "left-0 -translate-x-full -translate-y-1/2")
              : "left-full -translate-x-1/2 -translate-y-1/2",
            (edgeHovered || !isPermanentlyHidden) ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
          )}
          tooltipText={isPermanentlyHidden ? "Show Menu" : (sideMenuOpen ? "Collapse" : "Expand")}
          side="right"
          sideOffset={15}
          disabled={!edgeHovered && isPermanentlyHidden}
          hoverDelay={200}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-full cursor-pointer",
              "bg-charcoalBlueLight border border-slate-700 flex items-center justify-center",
              "text-slate-400 hover:text-white hover:bg-slate-700 shadow-lg",
              edgeHovered && isPermanentlyHidden && "bg-slate-700 text-white"
            )}
            onClick={() => {
              if (isPermanentlyHidden) {
                setIsPermanentlyHidden(false);
              } else if (sideMenuOpen) {
                setSideMenuOpen(false);
              } else if (allowHide) {
                setIsPermanentlyHidden(true);
              } else {
                setSideMenuOpen(true);
              }
            }}
            onMouseEnter={() => setEdgeHovered(true)}
            onMouseLeave={() => setEdgeHovered(false)}
          >
            {isPermanentlyHidden ? <ChevronRight size={16} /> : (sideMenuOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />)}
          </div>
        </TooltipWrapper>
      </aside>
    </>
  );
};

export default SideMenu;
