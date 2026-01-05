import React, { useRef, useState, useEffect } from "react";

interface GlowBorderProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;

	/** RGB color for the glow (e.g., "255, 255, 255"). */
	color?: string;

	/** Width of the border in pixels. Default: 1px. */
	borderWidth?: number;

	/** How far the glow extends on the border (px). Default: 150. */
	borderGlowRadius?: number;

	/** How far the glow extends INSIDE the component (px). Default: 300. */
	innerGlowRadius?: number;

	/** Opacity of the inner glow (0 to 1). Default: 0.1 (subtle). */
	innerGlowIntensity?: number;

	/** Background class for the content. Default: bg-slate-950. */
	contentClassName?: string;
}

const GlowBorder: React.FC<GlowBorderProps> = ({
	children,
	className = "",
	color = "171, 171, 171",
	borderWidth = 1,
	borderGlowRadius = 150,
	innerGlowRadius = 300,
	innerGlowIntensity = 0.1,
	contentClassName = "bg-slate-950",
	...props
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isHovering, setIsHovering] = useState(false);

	useEffect(() => {
		// We attach the listener to the window so the glow follows
		// the mouse even if it leaves the component boundaries.
		const handleMouseMove = (e: MouseEvent) => {
			if (!containerRef.current) return;

			const rect = containerRef.current.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			setPosition({ x, y });

			// Optional: Logic to determine if we are "close enough" to trigger effects
			// For now, we leave it active globally as requested, but you could
			// add a distance check here if you only want it to work within 500px etc.
			setIsHovering(true);
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	return (
		<div
			ref={containerRef}
			className={`relative overflow-hidden rounded-xl transition-all ${className}`}
			style={{ padding: borderWidth }} // The padding creates the physical border width
			{...props}
		>
			{/* 1. BORDER LAYER (The Background) */}
			<div
				className="absolute inset-0 transition-opacity duration-300"
				style={{
					background: `
            /* Dynamic Mouse Glow on Border */
            radial-gradient(
              ${borderGlowRadius}px circle at ${position.x}px ${position.y}px, 
              rgba(${color}, 1), 
              transparent 100%
            ),
            /* Static Shine (Top-Left + Bottom-Center) */
            radial-gradient(
              ${borderGlowRadius}px circle at 0% 0%, 
              rgba(${color}, 0.5) 0%, 
              transparent 100%
            ),
            radial-gradient(
              ${borderGlowRadius}px circle at 50% 100%, 
              rgba(${color}, 0.5) 0%, 
              transparent 100%
            )
          `,
				}}
			/>

			{/* 2. INNER CONTENT LAYER (The Mask) */}
			<div className={`relative h-full w-full rounded-[inherit] overflow-hidden ${contentClassName}`}>
				{/* 3. INNER GLOW OVERLAY 
            This sits ON TOP of the content background but BEHIND the text.
            It creates the "fog" or "light leak" effect inside the card.
        */}
				<div
					className="absolute inset-0 pointer-events-none mix-blend-screen"
					style={{
						background: `
               radial-gradient(
                 ${innerGlowRadius}px circle at ${position.x}px ${position.y}px, 
                 rgba(${color}, ${innerGlowIntensity}), 
                 transparent 100%
               )
             `,
					}}
				/>

				{/* 4. ACTUAL CHILDREN (Text/Content) */}
				<div className="relative z-10">{children}</div>
			</div>
		</div>
	);
};

export default GlowBorder;
