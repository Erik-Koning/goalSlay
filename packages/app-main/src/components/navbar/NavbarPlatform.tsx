"use client";

import React, { forwardRef, useRef, useEffect } from "react";
import styles from "./Navbar.module.css";
import { cn } from "@common/lib/utils";
interface NavbarPlatformProps {
	className?: string;
}

export const NavbarPlatform = forwardRef<HTMLDivElement, NavbarPlatformProps>(({ className, ...props }, ref) => {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleGlobalMouseMove = (e: MouseEvent) => {
			if (!containerRef.current) return;

			const rect = containerRef.current.getBoundingClientRect();
			
			// Calculate x and y relative to the container for the glow position
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			// Calculate distance to the nearest edge of the navbar
			// This makes the glow strongest when inside or very near
			const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
			const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
			const distance = Math.sqrt(dx * dx + dy * dy);

			// Define a threshold (400px) after which the glow is 0
			// The closer the mouse, the higher the opacity (up to 1)
			const threshold = 400;
			const opacity = Math.max(0, 1 - distance / threshold);

			containerRef.current.style.setProperty("--x", `${x}px`);
			containerRef.current.style.setProperty("--y", `${y}px`);
			containerRef.current.style.setProperty("--glow-opacity", opacity.toString());
		};

		window.addEventListener("mousemove", handleGlobalMouseMove);
		return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
	}, []);

	return (
		<div className="w-full">
			{/* Parent "Border" Container 
        - absolute: Positioned over content
        - top-[10px]: 10px from top
        - left-1/2 -translate-x-1/2: Horizontal centering
        - z-50: Ensures it stays on top of content
        - p-[1px]: Creates the physical space for the border
        - rounded-full: Fully rounded corners
        - shadow-2xl: Tailwind shadow
        - CSS Module: Handles the stacked gradients
      */}
			<div
				ref={containerRef}
				className={cn(
					"absolute top-[10px] left-1/2 -translate-x-1/2 z-50 overflow-hidden rounded-full p-[1px] shadow-2xl",
					styles.glowContainer,
					className
				)}
			>
				{/* Child "Glass" Container
           - h-full w-full: Fills parent, leaving only 1px gap visible
           - bg-slate-900/60: Blue-ish dark background with opacity
           - backdrop-blur-xl: The glass effect
        */}
				<nav className="relative flex h-full w-full items-center gap-6 rounded-full bg-slate-900/60 px-8 py-3 backdrop-blur-xl">
					{/* Example Logo / Brand */}
					<div className="font-semibold text-blue-100">Nexus</div>

					{/* Navigation Links */}
					<ul className="flex gap-6 text-sm font-medium text-slate-300">
						<li>
							<a href="#" className="transition-colors hover:text-white">
								Product
							</a>
						</li>
						<li>
							<a href="#" className="transition-colors hover:text-white">
								Solutions
							</a>
						</li>
						<li>
							<a href="#" className="transition-colors hover:text-white">
								Pricing
							</a>
						</li>
					</ul>

					{/* Call to Action */}
					<button className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20">Sign In</button>
				</nav>
			</div>
		</div>
	);
});
