"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import MoonBase from "@/public/imgs/MoonBase.png";
import Landscape from "@/public/Landscape2.png";
import SunsetLandscape from "@/components/heroSections/sunsetLandscape";
import CustomGlowBorder from "@common/components/wrappers/customGlowBorder";
import { Button } from "@common/components/ui/Button";
import { LightWarpButton } from "@/components/ui/LightWarpButton";
import { WarpTunnel } from "@/components/ui/WarpTunnel";
import { GoalCard } from "@/components/goals/GoalCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { IconTarget, IconPlus, IconTrendingUp } from "@tabler/icons-react";

interface Goal {
	id: string;
	title: string;
	description: string;
	status: string;
	targetDate?: string | null;
	councilScore?: number | null;
	councilReviewedAt?: string | null;
	_count?: {
		expertReviews?: number;
		goalUpdates?: number;
	};
}

export default function Page() {
	const [isWarping, setIsWarping] = useState(false);
	const [goals, setGoals] = useState<Goal[]>([]);
	const [isLoadingGoals, setIsLoadingGoals] = useState(true);
	const router = useRouter();

	// Fetch user's goals
	useEffect(() => {
		async function fetchGoals() {
			try {
				const response = await fetch("/api/goals?status=active");
				if (response.ok) {
					const data = await response.json();
					setGoals(data.goals || []);
				}
			} catch (error) {
				console.error("Failed to fetch goals:", error);
			} finally {
				setIsLoadingGoals(false);
			}
		}
		fetchGoals();
	}, []);

	const triggerWarp = useCallback(() => {
		if (isWarping) return;
		setIsWarping(true);
	}, [isWarping]);

	const handleWarpComplete = useCallback(() => {
		router.push("/goals/new");
	}, [router]);

	const hasGoals = goals.length > 0;

	return (
		<>
			{/* MoonBase Hero Banner */}
			<div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
				<Image
					src={MoonBase}
					alt="MoonBase - Your Goal Command Center"
					fill
					className="object-cover"
					priority
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="text-center text-white drop-shadow-lg">
						<h1 className="text-4xl md:text-5xl font-bold mb-2">Goal Command Center</h1>
						<p className="text-lg md:text-xl opacity-90">Your mission control for achievement</p>
					</div>
				</div>
			</div>

			{/* Goals Section */}
			<div className="container max-w-6xl py-8 space-y-8">
				{/* Active Goals */}
				<section>
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<IconTarget className="h-6 w-6 text-primary" />
							<h2 className="text-2xl font-bold">Your Active Goals</h2>
						</div>
						<Button variant="outline" onClick={() => router.push("/goals/new")}>
							<IconPlus className="mr-2 h-4 w-4" />
							New Goal
						</Button>
					</div>

					{isLoadingGoals ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{[1, 2, 3].map((i) => (
								<Card key={i}>
									<CardContent className="p-6 space-y-4">
										<Skeleton className="h-6 w-3/4" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-2/3" />
									</CardContent>
								</Card>
							))}
						</div>
					) : hasGoals ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{goals.map((goal) => (
								<GoalCard key={goal.id} goal={goal} />
							))}
						</div>
					) : (
						/* No goals - show CTA with landscape */
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
										delay: 0.25,
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
					)}
				</section>

				{/* Quick Stats */}
				{hasGoals && (
					<section className="grid gap-4 md:grid-cols-3">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Active Goals
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold">{goals.length}</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Expert Reviews
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold">
									{goals.reduce((sum, g) => sum + (g._count?.expertReviews || 0), 0)}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Updates Logged
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold">
									{goals.reduce((sum, g) => sum + (g._count?.goalUpdates || 0), 0)}
								</div>
							</CardContent>
						</Card>
					</section>
				)}
			</div>

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
