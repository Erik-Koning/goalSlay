"use client";

import Image from "next/image";
import Landscape from "@/public/Landscape2.png";
//import Knight from "@/public/Knight.png";
import SunsetLandscape from "@/components/heroSections/sunsetLandscape";
import GlowBorder from "@common/components/wrappers/glowBorder";
import SmartGlowBorder from "@common/components/wrappers/smartGlowBorder";
import CustomGlowBorder from "@common/components/wrappers/customGlowBorder";

export default function Page() {
	return (
		<>
			<SunsetLandscape backgroundSrc={Landscape} foregroundSrc={undefined} featherWidth="0%" containerClassName="p-3 md:p-4 xl:p-8">
				<CustomGlowBorder
					borderBackground="linear-gradient(to bottom right, #334155, #0f172a)"
					glowColor="255, 255, 255"
					borderWidth={1}
					borderGlowRadius={100}
					innerGlowRadius={200}
					innerGlowIntensity={0.2}
          glassClassName="bg-[#ffb171] opacity-30 rounded-xl"
          className="h-full backdrop-blur-[6px]"
				>
					<div className="z-40 p-4 text-black">
						<h1 className="text-4xl font-bold">The Eternal Quest</h1>
						<p className="text-lg">The knight stands guard over the shifting horizons.</p>
					</div>
				</CustomGlowBorder>
			</SunsetLandscape>
		</>
	);
}
