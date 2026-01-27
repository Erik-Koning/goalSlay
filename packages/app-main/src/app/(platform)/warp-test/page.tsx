"use client";

import { WarpTunnel } from "@/components/ui/WarpTunnel";

export default function WarpTestPage() {
	return (
		<WarpTunnel
			continuous
			showControls
			initialSettings={{
				imagePath: "/warp1.jpg",
			}}
		/>
	);
}
