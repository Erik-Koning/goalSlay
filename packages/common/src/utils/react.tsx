import React from "react";
import { cn } from "@common/lib/utils";

export function createChangeEvent(name: string, value: any): React.ChangeEvent<any> {
  const e = {
    target: {
      name: name, // Assuming registerName is the name of the input
      value: value,
    },
  } as unknown as React.ChangeEvent<any>;
  return e;
}

export function withWrapper(node: React.ReactNode, key: string, className?: string, divProps?: React.HTMLAttributes<HTMLDivElement>): React.ReactNode {
  if (React.isValidElement(node)) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return React.cloneElement(node as React.ReactElement<any>, {
      key,
      className: node?.props ? cn((node?.props as any)?.className, className) : className,
    });
  }
  return (
    <div key={key} {...divProps}>
      {node}
    </div>
  );
}
