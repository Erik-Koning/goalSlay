"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Landscape from "@/public/Landscape2.png";
import SunsetLandscape from "@/components/heroSections/sunsetLandscape";
import CustomGlowBorder from "@common/components/wrappers/customGlowBorder";
import { Button } from "@common/components/ui/Button";
import { LightWarpButton } from "@/components/ui/LightWarpButton";
import { WarpTunnel } from "@/components/ui/WarpTunnel";

export default function Page() {
	const [isWarping, setIsWarping] = useState(false);
	const router = useRouter();

	const triggerWarp = useCallback(() => {
		if (isWarping) return;
		setIsWarping(true);
	}, [isWarping]);

	const handleWarpComplete = useCallback(() => {
		router.push("/goals/new");
	}, [router]);

	return (
		<>
			<SunsetLandscape
				backgroundSrc={Landscape}
				foregroundSrc={undefined}
				featherWidth="0%"
				containerClassName="p-3 md:p-4 xl:p-8"
				contentClassName="flex flex-col gap-4 min-[801px]:top-6 min-[801px]:right-6 min-[801px]:translate-y-0 min-[801px]:mt-6 min-[801px]:mr-14 min-[801px]:pr-0 flex justify-end"
			>
				<div className="relative z-9999 flex flex-col gap-4">
					<motion.div
						animate={
							isWarping
								? {
										x: 600,
										y: -600,
										rotate: 25,
										scale: 1.5,
										opacity: 0,
									}
								: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
						}
						transition={{
							type: "spring",
							stiffness: 50,
							damping: 15,
							mass: 1,
							bounce: 0.5,
							duration: 1,
							delay: 0.5,
						}}
					>
						<CustomGlowBorder
							glowColor="255, 225, 170"
							glowBlendMode=""
							glowOpacity={undefined}
							borderWidth={2}
							borderGlowRadius={100}
							innerGlowRadius={200}
							innerGlowIntensity={0.2}
							glassClassName="bg-[#ffd7ad] opacity-[35%] rounded-xl"
							className="backdrop-blur-[6px]"
							borderBackground="linear-gradient(290deg, #6c249f, #7b2121, #bc5e16)"
						>
							<div className="z-40 p-4 text-[#283b59] flex flex-col gap-4">
								<h1 className="text-4xl font-bold">Goals are useless without action and progress tracking.</h1>
								<p className="text-2xl font-normal text-black">
									Set relevant goals, track your progress, and get coaching. Our AI agents will parse and create records from your reports of the day,
									helping you stay targeted and motivated to achieve your goals.
								</p>
							</div>
						</CustomGlowBorder>
					</motion.div>

					<motion.div
						animate={
							isWarping
								? {
										x: 800,
										y: -300,
										rotate: -15,
										scale: 1.2,
										opacity: 0,
									}
								: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
						}
						transition={{
							type: "spring",
							stiffness: 40,
							damping: 12,
							mass: 1.2,
							bounce: 0.6,
							delay: 0.25, // Slight delay to make them expand away
							duration: 1,
						}}
						onClick={triggerWarp}
						className="w-full cursor-pointer"
					>
						<LightWarpButton className="w-full z-9999">
							<CustomGlowBorder
								glowColor="255, 225, 170"
								glowBlendMode=""
								glowOpacity={undefined}
								borderWidth={2}
								borderGlowRadius={100}
								innerGlowRadius={200}
								innerGlowIntensity={0.2}
								glassClassName="bg-off-white opacity-[80%] rounded-xl"
								className="backdrop-blur-[6px] w-full"
								borderBackground="linear-gradient(290deg, #6c249f, #7b2121, #bc5e16)"
							>
								<Button variant="blank" size="lg" innerClassName="text-black" className="border-none bg-transparent cursor-pointer w-full">
									<span className="text-xl min-h-[55px] flex items-center justify-center text-black">Add First Goal</span>
								</Button>
							</CustomGlowBorder>
						</LightWarpButton>
					</motion.div>
				</div>
			</SunsetLandscape>

			{/* Warp Tunnel Transition */}
			<WarpTunnel
				isActive={isWarping}
				onComplete={handleWarpComplete}
				initialSettings={{
					baseHueRotate: 38,
					baseRotateRateZ: 11,
					animationDuration: 2.5,
					animationSpeedDuration: 30,
					imagePath: "/warp1.jpg",
					warpSceneFadeInDuration: 0.2,
					fadeToBlackDuration: 2,
					fadeOutDuration: 0.5,
					fadeInTogether: false,
				}}
			/>
		</>
	);
}
