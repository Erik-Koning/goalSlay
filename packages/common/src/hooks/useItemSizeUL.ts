import { useState, useEffect } from "react";

export interface ItemSizeUL {
  upperLeftPosition: { x: number; y: number };
  width: number;
  height: number;
}

export const getMaxElemWidthByRef = (ref?: any): number | null => {
  if (ref && ref.current) {
    const parent = ref.current.parentElement; // Get the parent element
    if (parent) {
      const parentRect = parent.getBoundingClientRect(); // Parent's dimensions
      const computedStyles = window.getComputedStyle(ref.current); // Current element's styles

      // Calculate max width considering padding and margins
      const maxWidth = parentRect.width - parseFloat(computedStyles.marginLeft) - parseFloat(computedStyles.marginRight);

      return maxWidth;
    }
  }
  return null; // Return null if no valid ref or parent
};

export const getElemSizeULByRef = (ref: any): ItemSizeUL => {
  if (ref && ref.current) {
    const rect = ref.current.getBoundingClientRect();
    ////console.log("rect", rect);
    const x = rect.left;
    const y = rect.top;
    const w = rect.width;
    const h = rect.height;
    return { upperLeftPosition: { x, y }, width: w, height: h };
  }
  return { upperLeftPosition: { x: 0, y: 0 }, width: 0, height: 0 };
};

//returns the fixed position of the upper left corner of the element, as well as its width and height
export function useItemSizeUL(ref?: React.RefObject<HTMLElement | null>, enable: boolean = true, otherDependencies: any[] = []): ItemSizeUL {
  // Hooks must always be called in the same order - never return early before hooks
  const [upperLeftPosition, setUpperLeftPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    // Skip if SSR, disabled, or no ref
    if (typeof window === "undefined" || !enable || !ref) return;

    const handleResize = () => {
      const { upperLeftPosition: XY, width: w, height: h } = getElemSizeULByRef(ref);
      if (XY && w && h) {
        setUpperLeftPosition(XY);
        setWidth(w);
        setHeight(h);
      }
    };

    // Initial measurement
    handleResize();

    // Delayed measurement to catch layout shifts
    const timeoutId = setTimeout(handleResize, 100);

    // Listen for window resize
    window.addEventListener("resize", handleResize);

    // Create a MutationObserver to catch attribute changes
    const observer = new MutationObserver(handleResize);
    observer.observe(document.body, {
      attributes: true,
      childList: false,
      subtree: false,
    });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [ref, enable, ...otherDependencies]);

  return { upperLeftPosition, width, height };
}
