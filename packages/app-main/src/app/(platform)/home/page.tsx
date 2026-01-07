"use client";

import Image from "next/image";
import Landscape from "@/public/Landscape2.png";
//import Knight from "@/public/Knight.png";
import SunsetLandscape from "@/components/heroSections/sunsetLandscape";
import GlowBorder from "@common/components/wrappers/glowBorder";
import SmartGlowBorder from "@common/components/wrappers/smartGlowBorder";
import CustomGlowBorder from "@common/components/wrappers/customGlowBorder";
import { Button } from "@common/components/ui/Button";

export default function Page() {
	return (
		<>
			<SunsetLandscape
				backgroundSrc={Landscape}
				foregroundSrc={undefined}
				featherWidth="0%"
				containerClassName="p-3 md:p-4 xl:p-8"
				contentClassName="flex flex-col gap-4 min-[801px]:top-6 min-[801px]:right-6 min-[801px]:translate-y-0 min-[801px]:mt-6 min-[801px]:mr-14 min-[801px]:pr-0 flex justify-end"
			>
				<CustomGlowBorder
					glowColor="255, 225, 170"
					//glowBlendMode=""
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
							Set relevant goals, track your progress, and get coaching. Our AI agents will parse and create records from your reports of the day, helping
							you stay targeted and motivated to achieve your goals.
						</p>
					</div>
				</CustomGlowBorder>
				<CustomGlowBorder
					glowColor="255, 225, 170"
					//glowBlendMode=""
					glowBlendMode=""
					glowOpacity={undefined}
					borderWidth={2}
					borderGlowRadius={100}
					innerGlowRadius={200}
					innerGlowIntensity={0.2}
					glassClassName="bg-[#ffd7ad] opacity-[80%] rounded-xl"
					className="backdrop-blur-[6px] w-full"
					borderBackground="linear-gradient(290deg, #6c249f, #7b2121, #bc5e16)"
				>
					<Button variant="blank" size="lg" innerClassName="text-black" className="border-none bg-transparent cursor-pointer w-full">
						<span className="text-xl min-h-[55px] flex items-center justify-center text-black">Add First Goal</span>
					</Button>
				</CustomGlowBorder>
			</SunsetLandscape>
		</>
	);
}
