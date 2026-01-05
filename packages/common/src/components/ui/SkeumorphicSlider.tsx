import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
import { cn } from "@common/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

const SkeumorphicSliderVariants = cva("rounded-full", {
  variants: {
    variant: {
      default: "",
    },
    size: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface SkeumorphicSliderProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof SkeumorphicSliderVariants> {
  className?: string;
}

export const SkeumorphicSlider = forwardRef<HTMLDivElement, SkeumorphicSliderProps>(({ className, variant, size, ...props }, ref) => {
  // Destructure out the Next.js specific props to prevent them from being passed to the div
  const { searchParams, params, ...restProps } = props as any;

  const mainShadow = "#444444";

  const mainShadowSize = 55;

  const width = 54;
  const height = 28;
  const mainBorderPadding = 4;
  const ringThickness = 0.5;
  const radius = 14;
  const circleDiameter = height - 2 * mainBorderPadding;
  const circleRadius = circleDiameter / 2;
  const circleX = width - circleRadius;
  const circleY = mainBorderPadding;

  const outerRingGradient = {
    backgroundImage: `linear-gradient(155deg, #333333 0%, #444444 30%, white)`,
  };

  const mainBorderGradient = {
    backgroundImage: `radial-gradient(circle ${mainShadowSize}px at 18% -30%, ${mainShadow}, white)`, //circle at x% y%, scale x% y%
  };

  const innerRingGradientStyle = {
    backgroundImage: `linear-gradient(155deg, #666666 30%, #BBBBBB)`, //circle at x% y%, scale x% y%
  };

  return (
    <div className="relative">
      <div
        id="outerRing"
        style={{
          height: height + ringThickness,
          width: width + ringThickness,
          padding: ringThickness,
          ...outerRingGradient,
        }}
        className="rounded-full pointer-events-none"
      >
        <div
          id="mainRing"
          style={{ ...mainBorderGradient, padding: mainBorderPadding }}
          className={cn("h-full w-full", SkeumorphicSliderVariants({ variant, size }), className)}
          ref={ref}
        >
          <div id="innerRing" style={{ ...innerRingGradientStyle, padding: ringThickness * 1 }} className="w-full h-full rounded-full bg-white">
            <div id="centerBG" style={{}} className="w-full h-full rounded-full bg-white">
              {/* Inside of the inner ring */}
              <div
                id="toggleCircle"
                style={{ height: circleDiameter - ringThickness * 4, width: circleDiameter - ringThickness * 4 }}
                className="rounded-full "
              ></div>
            </div>
          </div>
        </div>
      </div>
      {/* This is the new overlay div */}
      <div
        style={
          {
            height: height + ringThickness,
            width: width + ringThickness,
            backgroundImage: "linear-gradient(to right, rgba(182, 63, 63, 0.5), transparent)",
            maskImage: `radial-gradient(circle at center, transparent ${circleDiameter}px, black ${circleDiameter}px)`,
            WebkitMaskImage: `radial-gradient(circle at center, transparent ${circleDiameter}px, black ${circleDiameter}px)`,
            maskComposite: "exclude",
            WebkitMaskComposite: "destination-out",
          } as React.CSSProperties
        }
        className="absolute top-0 left-0 rounded-full pointer-events-none"
      />
    </div>
  );
});

SkeumorphicSlider.displayName = "SkeumorphicSlider";
