import { cn } from "../../lib/utils";
import { Plus, X } from "lucide-react";
import { cva, VariantProps } from "class-variance-authority";
import React, { forwardRef, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { CornerIcon } from "../ui/CornerIcon";

const FilterTagsVariants = cva("", {
  variants: {
    variant: {
      default: "",
    },
    size: {
      default: "",
    },
    overflow: {
      wrap: "flex flex-wrap gap-2",
      scroll: "flex gap-2 overflow-x-auto",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    overflow: "wrap",
  },
});

interface FilterTagsProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof FilterTagsVariants> {
  className?: string;
  tags: string[];
  initialActiveTags?: string[];
  onActiveTagsChange?: (tags: string[]) => void;
  onTagClick?: (tag: string) => void;
  overflow?: "wrap" | "scroll";
}

export const FilterTags = forwardRef<HTMLDivElement, FilterTagsProps>(
  ({ className, variant, size, tags, initialActiveTags, onTagClick, onActiveTagsChange, overflow, ...props }, ref) => {
    const [activeTags, setActiveTags] = useState<string[]>(initialActiveTags || []);

    useEffect(() => {
      onActiveTagsChange && onActiveTagsChange(activeTags);
    }, [activeTags]);

    const handleTagClick = (tag: string) => {
      const newActiveTags = activeTags.includes(tag) ? activeTags.filter((t) => t !== tag) : [...activeTags, tag];
      setActiveTags(newActiveTags);
      onTagClick && onTagClick(tag);
    };

    return (
      <div {...props} className={cn("pt-2 -mt-2", FilterTagsVariants({ variant, size, overflow }), className, "pb-4 -mb-4")} ref={ref}>
        {activeTags.length > 0 && (
          <Button
            variant={"dashedPill"}
            size={"tight"}
            className={"text-md py-0.5 px-0.5 bg-background border border-solid border-border hover:bg-faintPurple text-secondary-dark"}
            onClick={() => setActiveTags([])}
            tooltip="Remove all filters"
          >
            <X size={22} />
          </Button>
        )}
        {tags.map((tag) => {
          const isActive = activeTags.includes(tag);

          return (
            <CornerIcon
              key={tag}
              containerClassName={cn("border-dashed", isActive && "border-solid border-secondary-dark bg-ultraFaintPurple")}
              icon={
                isActive ? (
                  <X className={"text-tertiary-dark"} size={15} />
                ) : (
                  <Plus className={"text-border"} size={16} />
                )
              }
              corner="top-right"
              showOnlyOnHover={isActive ? false : true}
            >
              <Button
                key={tag}
                onClick={() => handleTagClick(tag)}
                variant={"dashedPill"}
                size={"tight"}
                className={cn(
                  "text-md py-0.5",
                  isActive
                    ? "bg-faintPurple border border-solid border-secondary-dark hover:bg-faintPurple"
                    : "border border-dashed border-border hover:bg-slate-50"
                )}
              >
                {tag}
              </Button>
            </CornerIcon>
          );
        })}
      </div>
    );
  }
);

FilterTags.displayName = "FilterTags";
