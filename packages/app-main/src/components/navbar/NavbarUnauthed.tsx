import { cn } from "@/lib/utils";

interface NavbarUnauthedProps extends React.HTMLAttributes<HTMLDivElement> {
  currentUser?: any;
  showBoarder?: boolean;
  className?: string;
}

const NavbarUnauthed: React.FC<NavbarUnauthedProps> = ({ currentUser, className, showBoarder = false, ...props }) => {
  return (
    <div
      className={cn(
        "fixed left-0 right-0 top-0 z-40 flex h-navbar-height items-center justify-between border-b border-slate-300 bg-background-blue opacity-90 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:text-white",
        { "border-none": !showBoarder },
        props.hidden && "hidden",
        className
      )}
      {...props}
    >
      <div className="container mx-auto flex h-full w-full max-w-7xl justify-end">
        <div className="flex items-center justify-center gap-4">
          {
            //Dark theme in BETA <ThemeToggle className="bg-transparent text-primary-light hover:bg-background-light" />
          }
        </div>
      </div>
    </div>
  );
};

export default NavbarUnauthed;
