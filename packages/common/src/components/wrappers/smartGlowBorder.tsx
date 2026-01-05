import React, { useRef, useState, useEffect } from "react";

interface SmartGlowBorderProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	borderWidth?: number;
	glowColor?: string; // The light color (RGB)
	baseBorderColor?: string; // The solid line color (Hex or RGB)
	borderGlowRadius?: number;
	innerGlowRadius?: number;
	innerGlowIntensity?: number;
	innerClassName?: string;
}

const SmartGlowBorder: React.FC<SmartGlowBorderProps> = ({
	children,
	className = "",
	innerClassName = "bg-slate-950 rounded-xl",
	borderWidth = 2,
	glowColor = "255, 255, 255",
	baseBorderColor = "transparent", // Default to transparent (glass effect)
	borderGlowRadius = 300,
	innerGlowRadius = 300,
	innerGlowIntensity = 0.1,
	...props
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const [outerRadius, setOuterRadius] = useState<string>("0px");
	const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

	useEffect(() => {
		if (!contentRef.current) return;
		const updateRadius = () => {
			const style = window.getComputedStyle(contentRef.current!);
			const innerRadius = parseFloat(style.borderRadius) || 0;
			setOuterRadius(`${innerRadius + borderWidth}px`);
		};
		updateRadius();
		const observer = new ResizeObserver(updateRadius);
		observer.observe(contentRef.current);
		return () => observer.disconnect();
	}, [borderWidth, innerClassName]);

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
			className={`relative w-fit transition-all ${className}`}
			style={{
				padding: borderWidth,
				borderRadius: outerRadius,
				backgroundColor: baseBorderColor, // <--- APPLIED HERE
			}}
			{...props}
		>
			{/* GLOW LAYER: Sits on top of the baseBorderColor */}
			<div
				className="absolute inset-0 transition-opacity duration-300 ease-in-out"
				style={{
					borderRadius: outerRadius,
					background: `
            radial-gradient(${borderGlowRadius}px circle at ${mousePos.x}px ${mousePos.y}px, rgba(${glowColor}, 1), transparent 100%),
            radial-gradient(${borderGlowRadius}px circle at 0% 0%, rgba(${glowColor}, 0.5) 0%, transparent 100%),
            radial-gradient(${borderGlowRadius}px circle at 50% 100%, rgba(${glowColor}, 0.5) 0%, transparent 100%)
          `,
				}}
			/>

			<div ref={contentRef} className={`relative h-full w-full overflow-hidden ${innerClassName}`}>
				<div
					className="absolute inset-0 pointer-events-none mix-blend-hard-light"
					style={{
						background: `radial-gradient(${innerGlowRadius}px circle at ${mousePos.x}px ${mousePos.y}px, rgba(${glowColor}, ${innerGlowIntensity}), transparent 100%)`,
					}}
				/>
				<div className="relative z-10">{children}</div>
			</div>
		</div>
	);
};

export default SmartGlowBorder;
