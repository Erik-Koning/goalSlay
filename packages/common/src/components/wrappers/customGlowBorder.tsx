import { cn } from "@common/lib/utils";
import React, { useRef, useState, useEffect } from "react";

interface HollowGlowBorderProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;

	/** CSS background for the border (colors/gradients). */
	borderBackground?: string;

	/** Width of the border in pixels. */
	borderWidth?: number;

	/** RGB color for the active mouse glow. */
	glowColor?: string;

	/** Radius of the mouse spotlight on the border. */
	borderGlowRadius?: number;

	/** Radius of the mouse spotlight inside the content. */
	innerGlowRadius?: number;

	/** Opacity of the inner glow (0 to 1). */
	innerGlowIntensity?: number;

	/** * Styles for the GLASS BACKGROUND (Sibling to content).
	 * Apply bg colors with opacity here (e.g. "bg-slate-900/20 backdrop-blur-md").
	 * Text inside will NOT be affected by opacity here.
	 */
	glassClassName?: string;

	/**
	 * Styles for the CONTENT container (Parent of children).
	 * Use this for padding, flex alignment, etc.
	 */
	contentClassName?: string;
}

const HollowGlowBorder: React.FC<HollowGlowBorderProps> = ({
	children,
	className = "",
	glassClassName = "bg-slate-900/20 backdrop-blur-xl", // Default Glass
	contentClassName = "p-6", // Default padding
	borderBackground = "linear-gradient(to bottom right, #334155, #0f172a)",
	borderWidth = 2,
	glowColor = "255, 255, 255",
	borderGlowRadius = 300,
	innerGlowRadius = 300,
	innerGlowIntensity = 0.1,
	...props
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const bgRef = useRef<HTMLDivElement>(null); // We measure radius from the bg layer now

	const [outerRadius, setOuterRadius] = useState<string>("0px");
	const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

	// 1. Auto-Calculate Outer Radius based on the Glass Layer's radius
	useEffect(() => {
		if (!bgRef.current) return;
		const updateRadius = () => {
			const style = window.getComputedStyle(bgRef.current!);
			const innerRadius = parseFloat(style.borderRadius) || 0;
			setOuterRadius(`${innerRadius + borderWidth}px`);
		};
		updateRadius();
		const observer = new ResizeObserver(updateRadius);
		observer.observe(bgRef.current);
		return () => observer.disconnect();
	}, [borderWidth, glassClassName]);

	// 2. Mouse Tracking
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!containerRef.current) return;
			const rect = containerRef.current.getBoundingClientRect();
			setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
		};
		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	return (
		<div
			ref={containerRef}
			className={cn("relative w-fit", className)}
			style={{
				padding: borderWidth,
				borderRadius: outerRadius,
			}}
			{...props}
		>
			{/* --- LAYER 1: HOLLOW BORDER (The Frame) --- */}
			<div
				className="absolute inset-0 transition-opacity duration-300 ease-in-out"
				style={{
					borderRadius: outerRadius,
					padding: borderWidth,
					background: `
            radial-gradient(
              ${borderGlowRadius}px circle at ${mousePos.x}px ${mousePos.y}px, 
              rgba(${glowColor}, 1), 
              transparent 100%
            ),
            ${borderBackground}
          `,
					mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
					maskComposite: "exclude",
					WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
					WebkitMaskComposite: "xor",
				}}
			/>

			{/* --- LAYER 2: GLASS BACKGROUND (The Window) --- 
          This is a SIBLING to content. Opacity here does not affect text.
      */}
			<div
				ref={bgRef}
				className={`absolute inset-[${borderWidth}px] overflow-hidden rounded-xl ${glassClassName}`}
				style={{
					// We use absolute positioning to fill the inner area exactly
					top: borderWidth,
					left: borderWidth,
					right: borderWidth,
					bottom: borderWidth,
				}}
			>
				{/* Inner Glow (Light Leak) - Lives inside the glass layer */}
				<div
					className="absolute inset-0 pointer-events-none mix-blend-hard-light"
					style={{
						background: `
              radial-gradient(
                ${innerGlowRadius}px circle at ${mousePos.x}px ${mousePos.y}px, 
                rgba(${glowColor}, ${innerGlowIntensity}), 
                transparent 100%
              )
            `,
					}}
				/>
			</div>

			{/* --- LAYER 3: ACTUAL CONTENT (The Foreground) --- 
          Positioned relatively to ensure it sits on top.
      */}
			<div className={`relative h-full w-full ${contentClassName}`}>{children}</div>
		</div>
	);
};

export default HollowGlowBorder;
