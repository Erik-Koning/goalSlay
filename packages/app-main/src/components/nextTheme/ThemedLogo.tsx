"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import wordLogoLight from "@/public/imgs/Refdocs_Logo_ColourWhite_SVG.svg";
import wordLogoDark from "@/public/imgs/Refdocs_Logo_Colour_SVG.svg";

import { forwardRef } from "react";
import { Link } from "@common/components/ui/Link";
import { cn } from "@/lib/utils";

interface ThemedLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  force?: "light" | "dark" | undefined;
  width?: number;
  height?: number;
  sizes?: string;
}

export const ThemedLogo = forwardRef<HTMLDivElement, ThemedLogoProps>(
  (
    {
      force,
      width = 196,
      height = 196,
      sizes = `(max-width: 200px) 100vw,
              (max-width: 200px) 50vw,
  33vw`,
      className,
      ...props
    },
    ref
  ) => {
    const router = useRouter();
    const { resolvedTheme } = useTheme();

    return (
      <div className="flex">
        <Link href="/" className="flex appearance-none">
          {(!force && resolvedTheme === "dark") || force === "dark" ? (
            <div className="flex" data-hide-on-theme="dark">
              <Image
                className={cn("flex h-auto max-w-[250px] p-1", className)}
                src={wordLogoLight ?? `https://${process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME}/wp-content/uploads/2023/07/RefdocsTM-logo.svg`}
                width={width}
                height={height}
                sizes={sizes}
                style={{ objectFit: "contain" }}
                alt="Word Logo Dark Theme"
              />
            </div>
          ) : (
            <div className="flex" data-hide-on-theme="light">
              <Image
                className={cn("flex h-auto max-w-[250px] p-1", className)}
                src={wordLogoDark ?? `https://${process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME}/wp-content/uploads/2023/07/RefdocsTM-logo.svg`}
                priority={true}
                width={width}
                height={height}
                sizes={sizes}
                style={{ objectFit: "contain" }}
                alt="Word Logo Light Theme"
              />
            </div>
          )}
        </Link>
      </div>
    );
  }
);

ThemedLogo.displayName = "ThemedLogo";
