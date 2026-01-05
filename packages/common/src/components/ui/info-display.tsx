import camelOrSnakeToTitleCase from "@common/utils/camelOrSnakeToTitleCase";
import { Check } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { gradientClassName } from "@common/lib/tailwind/classNames";
import { CardWithLabels } from "./cardWithLabels";
import { reorderObjectKeys, reorderObjectKeysByIndex } from "@common/utils/objectManipulation";

const infoDisplayVariants = cva("w-full rounded-lg p-5", {
  variants: {
    variant: {
      default: "border-2 border-green bg-emerald-50",
      modern: cn("relative text-white"),
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const gridVariants = cva("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4", {
  variants: {
    variant: {
      default: "gap-4",
      modern: "gap-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const itemVariants = cva("rounded-lg shadow-sm", {
  variants: {
    variant: {
      default: "border-l-4 border-primary/80 bg-white p-4",
      modern: "border border-white/30 bg-white/10 p-2 backdrop-blur-sm",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const itemKeyVariants = cva("text-xs font-semibold uppercase tracking-wide", {
  variants: {
    variant: {
      default: "mb-2 text-gray-500",
      modern: "mb-1 text-white/80",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const itemValueVariants = cva("text-lg font-bold", {
  variants: {
    variant: {
      default: "text-gray-900",
      modern: "text-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface InfoDisplayProps extends VariantProps<typeof infoDisplayVariants> {
  title: string;
  data: Record<string, string | number>;
  combineKeys?: string[][];
  reOrderKeys?: Record<string, number>;
  className?: string;
  labelJSX?: React.ReactNode;
  rightLabelJSX?: React.ReactNode;
}

export function InfoDisplay({ title, data, combineKeys, variant, className, labelJSX, rightLabelJSX, reOrderKeys }: InfoDisplayProps) {
  let finalData: Record<string, string | number> = { ...data };

  if (combineKeys && combineKeys.length > 0) {
    const processedData = { ...data };
    const combinedEntries: Record<string, string | number> = {};

    combineKeys.forEach((keysToCombine) => {
      const validKeys = keysToCombine.filter((key) => Object.prototype.hasOwnProperty.call(processedData, key));

      if (validKeys.length > 0) {
        const newKey = validKeys.map((key) => camelOrSnakeToTitleCase(key)).join(" & ");
        const newValue = validKeys.map((key) => processedData[key]).join(" • ");
        console.log("newKey", newKey);
        combinedEntries[newKey] = newValue;

        validKeys.forEach((key) => {
          delete processedData[key];
        });
      }
    });

    finalData = { ...processedData, ...combinedEntries };
  }

  //Re order only the keys specified in the reOrderKeys object
  if (reOrderKeys && Object.keys(reOrderKeys).length > 0) {
    finalData = reorderObjectKeysByIndex(finalData, reOrderKeys);
  }

  const gridContent = Object.entries(finalData).map(([key, value]) => (
    <div key={key} className={cn(itemVariants({ variant }))}>
      <div className={cn(itemKeyVariants({ variant }))}>{camelOrSnakeToTitleCase(key)}</div>
      <div className={cn(itemValueVariants({ variant }))}>{String(value)}</div>
    </div>
  ));

  return (
    <CardWithLabels leftLabelJSX={labelJSX} rightLabelJSX={rightLabelJSX} title={title}>
      <div className={cn(gridVariants({ variant }))}>{gridContent}</div>
    </CardWithLabels>
  );
}
