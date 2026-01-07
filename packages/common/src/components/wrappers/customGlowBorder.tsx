import { cn } from "@common/lib/utils";
import React, { useRef, useState, useEffect } from "react";

interface HollowGlowBorderProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;

	/** * The Static Border Pattern.
	 * Accepts any CSS background value: solid colors, linear-gradients, conic-gradients, or images.
	 * Example: "linear-gradient(to right, #444, #000)"
	 */
	borderBackground?: string;

	/** Width of the border in pixels. */
	borderWidth?: number;

	/** RGB color for the active mouse glow (e.g. "100, 200, 255"). */
	glowColor?: string;

	/** * How the mouse glow blends with the static border.
	 * - "normal": The glow sits on top like a solid light (covers the border).
	 * - "overlay" / "screen" / "soft-light": The glow mixes with the border pattern.
	 * - "plus-lighter": Adds light values (neon effect).
	 */
	glowBlendMode?: React.CSSProperties["backgroundBlendMode"];

	/** * Max opacity of the mouse glow center (0 to 1).
	 * Set to < 1 if you want the border to show through the glow slightly.
	 */
	glowOpacity?: number;

	/** Radius of the mouse spotlight on the border. */
	borderGlowRadius?: number;

	/** Radius of the mouse spotlight inside the content. */
	innerGlowRadius?: number;

	/** Opacity of the inner glow (0 to 1). */
	innerGlowIntensity?: number;

	/** Styles for the GLASS BACKGROUND (Sibling to content). */
	glassClassName?: string;

	/** Styles for the CONTENT container. */
	contentClassName?: string;
}

const HollowGlowBorder: React.FC<HollowGlowBorderProps> = ({
	children,
	className = "",
	glassClassName = "bg-slate-900/20 backdrop-blur-xl",
	contentClassName = "",
	// Default: A subtle dark gradient
	borderBackground = "linear-gradient(to bottom right, #334155, #0f172a)",
	borderWidth = 2,
	glowColor = "255, 255, 255",
	glowBlendMode = "normal", // Default to solid cover
	glowOpacity = 1, // Default to full strength
	borderGlowRadius = 300,
	innerGlowRadius = 300,
	innerGlowIntensity = 0.1,
	...props
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const bgRef = useRef<HTMLDivElement>(null);

	const [outerRadius, setOuterRadius] = useState<string>("0px");
	const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

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
			{/* --- LAYER 1: HOLLOW BORDER --- */}
			<div
				className="absolute inset-0 transition-opacity duration-300 ease-in-out"
				style={{
					borderRadius: outerRadius,
					padding: borderWidth,

					// 1. The Background Stack
					background: `
            /* Top Layer: The Dynamic Mouse Glow */
            radial-gradient(
              ${borderGlowRadius}px circle at ${mousePos.x}px ${mousePos.y}px, 
              rgba(${glowColor}, ${glowOpacity}), 
              transparent 100%
            ),
            /* Bottom Layer: The Static Border Pattern */
            ${borderBackground}
          `,

					// 2. The Blend Mode Logic
					// We specify the blend mode for [Layer 1], [Layer 2]
					backgroundBlendMode: `${glowBlendMode}, normal`,

					// 3. The Masking Logic (Hollow Center)
					mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
					maskComposite: "exclude",
					WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
					WebkitMaskComposite: "xor",
				}}
			/>

			{/* --- LAYER 2: GLASS BACKGROUND --- */}
			<div
				ref={bgRef}
				className={`absolute inset-[${borderWidth}px] overflow-hidden rounded-xl ${glassClassName}`}
				style={{
					top: borderWidth,
					left: borderWidth,
					right: borderWidth,
					bottom: borderWidth,
				}}
			>
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

			{/* --- LAYER 3: ACTUAL CONTENT --- */}
			<div className={cn("relative h-full w-full", contentClassName)}>{children}</div>
		</div>
	);
};

export default HollowGlowBorder;
