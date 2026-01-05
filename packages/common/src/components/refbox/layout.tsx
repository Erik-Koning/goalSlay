import { Inter } from "next/font/google";
import { cn } from "@common/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn("bg-background-light text-slate-900 antialiased dark:bg-background-dark", inter.className)}>
      <div className="pt-25">
        <div className="">{children}</div>
      </div>
    </div>
  );
}
