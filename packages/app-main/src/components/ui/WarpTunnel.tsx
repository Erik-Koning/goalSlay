"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./WarpTunnel.css";

export interface WarpSettings {
	perspective: number;
	wrapSize: number;
	translateZ: number;
	animationDuration: number;
	animationSpeedDuration: number; //Sets the motion speed of the warp scene
	imagePath: string;
	// Base warp effect settings (always applied)
	baseHueRotate: number;
	baseScaleX: number;
	baseRotateX: number;
	baseRotateY: number;
	baseRotateZ: number;
	baseRotateRateZ: number; // degrees per second
	// Psychedelic peak effect settings (applied at 50% of psychedelic animation)
	peakHueRotate: number;
	peakScaleX: number;
	peakRotateX: number;
	peakRotateY: number;
	peakRotateZ: number;
	rotateRateX: number; // degrees per second
	rotateRateY: number;
	rotateRateZ: number;
	// Transition fade settings
	fadeToBlackDuration: number; // seconds
	fadeOutDuration: number;
	warpSceneFadeInDuration: number; // seconds
	fadeInTogether: boolean; // if true, black bg and warp scene fade in together
}

const DEFAULT_SETTINGS: WarpSettings = {
	perspective: 5,
	wrapSize: 1000,
	translateZ: 500,
	animationDuration: 5,
	animationSpeedDuration: 30,
	imagePath: "",
	// Base defaults (applied always)
	baseHueRotate: 0,
	baseScaleX: 1,
	baseRotateX: 0,
	baseRotateY: 0,
	baseRotateZ: 0,
	baseRotateRateZ: 0,
	// Psychedelic peak defaults
	peakHueRotate: 50,
	peakScaleX: 100,
	peakRotateX: 0,
	peakRotateY: 0,
	peakRotateZ: 0,
	rotateRateX: 0,
	rotateRateY: 0,
	rotateRateZ: 0,
	// Transition fade defaults
	fadeToBlackDuration: 0.4,
	warpSceneFadeInDuration: 0.3,
	fadeOutDuration: 0.5,
	fadeInTogether: true,
};

interface WarpTunnelProps {
	/** Whether the warp effect is currently active */
	isActive?: boolean;
	/** Callback when the animation cycle completes (usually triggers redirect) */
	onComplete?: () => void;
	/** Show tuning controls panel */
	showControls?: boolean;
	/** Initial settings (merged with defaults) */
	initialSettings?: Partial<WarpSettings>;
	/** For continuous display without fade in/out wrapper */
	continuous?: boolean;
	/** Enable psychedelic hue-rotate effect */
	psychedelic?: boolean;
}

/**
 * 3D CSS Hyperspace tunnel warp effect.
 * Can be used as a transition effect or continuous background.
 * Tunable via props and optional controls panel.
 */
export function WarpTunnel({
	isActive = true,
	onComplete,
	showControls = false,
	initialSettings,
	continuous = false,
	psychedelic = false,
}: WarpTunnelProps) {
	const [settings, setSettings] = useState<WarpSettings>({
		...DEFAULT_SETTINGS,
		...initialSettings,
	});

	const [isPsychedelic, setIsPsychedelic] = useState(psychedelic);
	const [isPsychedelicBurst, setIsPsychedelicBurst] = useState(false);

	const updateSetting = useCallback((key: keyof WarpSettings, value: number | string) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
	}, []);

	// Handle completion callback for transition mode
	React.useEffect(() => {
		if (isActive && onComplete && !continuous) {
			const timer = setTimeout(onComplete, settings.animationDuration * 1000);
			return () => clearTimeout(timer);
		}
	}, [isActive, onComplete, continuous]);

	// Generate CSS custom properties
	const cssVars = {
		"--warp-perspective": `${settings.perspective}px`,
		"--warp-size": `${settings.wrapSize}px`,
		"--warp-half-size": `${settings.wrapSize / 2}px`,
		"--warp-translate-z": `${settings.translateZ}px`,
		"--warp-duration": `${settings.animationSpeedDuration}s`,
		"--warp-delay": `${settings.animationSpeedDuration / 2}s`,
		// Base effect variables (always applied)
		"--warp-base-hue-rotate": `${settings.baseHueRotate}deg`,
		"--warp-base-scale-x": settings.baseScaleX,
		"--warp-base-rotate-x": `${settings.baseRotateX}deg`,
		"--warp-base-rotate-y": `${settings.baseRotateY}deg`,
		"--warp-base-rotate-z": `${settings.baseRotateZ}deg`,
		"--warp-base-rotate-rate-z": settings.baseRotateRateZ,
		// Psychedelic peak effect variables
		"--warp-peak-hue-rotate": `${settings.peakHueRotate}deg`,
		"--warp-peak-scale-x": settings.peakScaleX,
		"--warp-peak-rotate-x": `${settings.peakRotateX}deg`,
		"--warp-peak-rotate-y": `${settings.peakRotateY}deg`,
		"--warp-peak-rotate-z": `${settings.peakRotateZ}deg`,
		"--warp-rotate-rate-x": `${settings.rotateRateX}deg`,
		"--warp-rotate-rate-y": `${settings.rotateRateY}deg`,
		"--warp-rotate-rate-z": `${settings.rotateRateZ}deg`,
	} as React.CSSProperties;

	// Wall style with optional image - if imagePath given, use background image
	const wallStyle: React.CSSProperties | undefined = settings.imagePath
		? { background: `url(${settings.imagePath})`, backgroundSize: "cover" }
		: undefined;

	const sceneClassName = isPsychedelicBurst
		? "warp-scene warp-scene-psychedelic-burst"
		: isPsychedelic
		? "warp-scene warp-scene-psychedelic"
		: "warp-scene";

	const warpScene = (
		<div className={sceneClassName} style={cssVars}>
			<div className="warp-wrap">
				<div className="warp-wall warp-wall-right" style={wallStyle}></div>
				<div className="warp-wall warp-wall-left" style={wallStyle}></div>
				<div className="warp-wall warp-wall-top" style={wallStyle}></div>
				<div className="warp-wall warp-wall-bottom" style={wallStyle}></div>
				<div className="warp-wall warp-wall-back" style={wallStyle}></div>
			</div>
			<div className="warp-wrap warp-wrap-delayed">
				<div className="warp-wall warp-wall-right" style={wallStyle}></div>
				<div className="warp-wall warp-wall-left" style={wallStyle}></div>
				<div className="warp-wall warp-wall-top" style={wallStyle}></div>
				<div className="warp-wall warp-wall-bottom" style={wallStyle}></div>
				<div className="warp-wall warp-wall-back" style={wallStyle}></div>
			</div>
		</div>
	);

	const controlsPanel = showControls && (
		<div className="fixed top-4 left-4 z-50 bg-black/80 p-4 rounded-lg border border-white/20 w-80">
			<h2 className="text-lg font-bold mb-4 text-white">Warp Tuner</h2>

			<div className="space-y-4">
				<div>
					<label className="block text-sm mb-1 text-white">Perspective: {settings.perspective}px</label>
					<input
						type="range"
						min="1"
						max="50"
						value={settings.perspective}
						onChange={(e) => updateSetting("perspective", Number(e.target.value))}
						className="w-full"
					/>
				</div>

				<div>
					<label className="block text-sm mb-1 text-white">Wrap Size: {settings.wrapSize}px</label>
					<input
						type="range"
						min="200"
						max="2000"
						step="100"
						value={settings.wrapSize}
						onChange={(e) => updateSetting("wrapSize", Number(e.target.value))}
						className="w-full"
					/>
				</div>

				<div>
					<label className="block text-sm mb-1 text-white">TranslateZ: {settings.translateZ}px</label>
					<input
						type="range"
						min="100"
						max="1000"
						step="50"
						value={settings.translateZ}
						onChange={(e) => updateSetting("translateZ", Number(e.target.value))}
						className="w-full"
					/>
				</div>

				<div>
					<label className="block text-sm mb-1 text-white">Animation Duration: {settings.animationDuration}s</label>
					<input
						type="range"
						min="1"
						max="30"
						step="0.5"
						value={settings.animationDuration}
						onChange={(e) => updateSetting("animationDuration", Number(e.target.value))}
						className="w-full"
					/>
				</div>
				<div>
					<label className="block text-sm mb-1 text-white">Animation Speed Duration: {settings.animationSpeedDuration}s</label>
					<input
						type="range"
						min="1"
						max="30"
						step="0.5"
						value={settings.animationSpeedDuration}
						onChange={(e) => updateSetting("animationSpeedDuration", Number(e.target.value))}
						className="w-full"
					/>
				</div>

				{/* Transition Fade Controls */}
				<div className="pt-2 border-t border-white/20 space-y-3">
					<p className="text-xs text-gray-400 font-semibold">Transition Fade Settings</p>

					<div>
						<label className="block text-sm mb-1 text-white">Fade to Black Duration: {settings.fadeToBlackDuration}s</label>
						<input
							type="range"
							min="0"
							max="2"
							step="0.1"
							value={settings.fadeToBlackDuration}
							onChange={(e) => updateSetting("fadeToBlackDuration", Number(e.target.value))}
							className="w-full"
						/>
					</div>

					<div>
						<label className="block text-sm mb-1 text-white">Warp Scene Fade In: {settings.warpSceneFadeInDuration}s</label>
						<input
							type="range"
							min="0"
							max="2"
							step="0.1"
							value={settings.warpSceneFadeInDuration}
							onChange={(e) => updateSetting("warpSceneFadeInDuration", Number(e.target.value))}
							className="w-full"
						/>
					</div>

					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id="fade-together-toggle"
							checked={settings.fadeInTogether}
							onChange={(e) => updateSetting("fadeInTogether", e.target.checked ? 1 : 0)}
							className="w-4 h-4"
						/>
						<label htmlFor="fade-together-toggle" className="text-sm text-white cursor-pointer">
							Fade In Together (no delay)
						</label>
					</div>
				</div>

				<div>
					<label className="block text-sm mb-1 text-white">Image Path (public folder)</label>
					<input
						type="text"
						value={settings.imagePath}
						onChange={(e) => updateSetting("imagePath", e.target.value)}
						placeholder="/warp-stars.jpg"
						className="w-full px-2 py-1 bg-black border border-white/30 rounded text-sm text-white"
					/>
					<p className="text-xs text-gray-400 mt-1">Place image in /public folder, enter path like /filename.jpg</p>
				</div>

				{/* Base Warp Effect Controls - Always visible */}
				<div className="pt-2 border-t border-white/20 space-y-3">
					<p className="text-xs text-gray-400 font-semibold">Base Warp Effects</p>

					<div>
						<label className="block text-sm mb-1 text-white">Base Hue Rotate: {settings.baseHueRotate}°</label>
						<input
							type="range"
							min="-180"
							max="180"
							value={settings.baseHueRotate}
							onChange={(e) => updateSetting("baseHueRotate", Number(e.target.value))}
							className="w-full"
						/>
					</div>

					<div>
						<label className="block text-sm mb-1 text-white">Base Scale X: {settings.baseScaleX}</label>
						<input
							type="range"
							min="0.1"
							max="10"
							step="0.1"
							value={settings.baseScaleX}
							onChange={(e) => updateSetting("baseScaleX", Number(e.target.value))}
							className="w-full"
						/>
					</div>

					<div>
						<label className="block text-sm mb-1 text-white">Base Rotate X: {settings.baseRotateX}°</label>
						<input
							type="range"
							min="-180"
							max="180"
							value={settings.baseRotateX}
							onChange={(e) => updateSetting("baseRotateX", Number(e.target.value))}
							className="w-full"
						/>
					</div>

					<div>
						<label className="block text-sm mb-1 text-white">Base Rotate Y: {settings.baseRotateY}°</label>
						<input
							type="range"
							min="-180"
							max="180"
							value={settings.baseRotateY}
							onChange={(e) => updateSetting("baseRotateY", Number(e.target.value))}
							className="w-full"
						/>
					</div>

					<div>
						<label className="block text-sm mb-1 text-white">Base Rotate Z: {settings.baseRotateZ}°</label>
						<input
							type="range"
							min="-180"
							max="180"
							value={settings.baseRotateZ}
							onChange={(e) => updateSetting("baseRotateZ", Number(e.target.value))}
							className="w-full"
						/>
					</div>

					<div>
						<label className="block text-sm mb-1 text-white">Base Rotate Rate Z: {settings.baseRotateRateZ}°/s</label>
						<input
							type="range"
							min="0"
							max="360"
							value={settings.baseRotateRateZ}
							onChange={(e) => updateSetting("baseRotateRateZ", Number(e.target.value))}
							className="w-full"
						/>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="psychedelic-toggle"
						checked={isPsychedelic}
						onChange={(e) => {
							setIsPsychedelic(e.target.checked);
							if (e.target.checked) setIsPsychedelicBurst(false);
						}}
						className="w-4 h-4"
					/>
					<label htmlFor="psychedelic-toggle" className="text-sm text-white cursor-pointer">
						Psychedelic Mode (infinite)
					</label>
				</div>

				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="psychedelic-burst-toggle"
						checked={isPsychedelicBurst}
						onChange={(e) => {
							setIsPsychedelicBurst(e.target.checked);
							if (e.target.checked) setIsPsychedelic(false);
						}}
						className="w-4 h-4"
					/>
					<label htmlFor="psychedelic-burst-toggle" className="text-sm text-white cursor-pointer">
						Psychedelic Burst (peaks then reverts)
					</label>
				</div>

				{/* Psychedelic Peak Effect Controls */}
				{(isPsychedelic || isPsychedelicBurst) && (
					<div className="pt-2 border-t border-white/20 space-y-3">
						<p className="text-xs text-gray-400 font-semibold">Psychedelic Peak Settings (at 50%)</p>

						<div>
							<label className="block text-sm mb-1 text-white">Peak Hue Rotate: {settings.peakHueRotate}°</label>
							<input
								type="range"
								min="0"
								max="180"
								value={settings.peakHueRotate}
								onChange={(e) => updateSetting("peakHueRotate", Number(e.target.value))}
								className="w-full"
							/>
						</div>

						<div>
							<label className="block text-sm mb-1 text-white">Peak Scale X: {settings.peakScaleX}</label>
							<input
								type="range"
								min="1"
								max="5000"
								step="10"
								value={settings.peakScaleX}
								onChange={(e) => updateSetting("peakScaleX", Number(e.target.value))}
								className="w-full"
							/>
						</div>

						<div>
							<label className="block text-sm mb-1 text-white">Peak Rotate X: {settings.peakRotateX}°</label>
							<input
								type="range"
								min="-180"
								max="180"
								value={settings.peakRotateX}
								onChange={(e) => updateSetting("peakRotateX", Number(e.target.value))}
								className="w-full"
							/>
						</div>

						<div>
							<label className="block text-sm mb-1 text-white">Peak Rotate Y: {settings.peakRotateY}°</label>
							<input
								type="range"
								min="-180"
								max="180"
								value={settings.peakRotateY}
								onChange={(e) => updateSetting("peakRotateY", Number(e.target.value))}
								className="w-full"
							/>
						</div>

						<div>
							<label className="block text-sm mb-1 text-white">Peak Rotate Z: {settings.peakRotateZ}°</label>
							<input
								type="range"
								min="-180"
								max="180"
								value={settings.peakRotateZ}
								onChange={(e) => updateSetting("peakRotateZ", Number(e.target.value))}
								className="w-full"
							/>
						</div>

						<div>
							<label className="block text-sm mb-1 text-white">Rotate Rate X: {settings.rotateRateX}°/s</label>
							<input
								type="range"
								min="0"
								max="360"
								value={settings.rotateRateX}
								onChange={(e) => updateSetting("rotateRateX", Number(e.target.value))}
								className="w-full"
							/>
						</div>

						<div>
							<label className="block text-sm mb-1 text-white">Rotate Rate Y: {settings.rotateRateY}°/s</label>
							<input
								type="range"
								min="0"
								max="360"
								value={settings.rotateRateY}
								onChange={(e) => updateSetting("rotateRateY", Number(e.target.value))}
								className="w-full"
							/>
						</div>

						<div>
							<label className="block text-sm mb-1 text-white">Rotate Rate Z: {settings.rotateRateZ}°/s</label>
							<input
								type="range"
								min="0"
								max="360"
								value={settings.rotateRateZ}
								onChange={(e) => updateSetting("rotateRateZ", Number(e.target.value))}
								className="w-full"
							/>
						</div>
					</div>
				)}

				<div className="pt-2 border-t border-white/20">
					<p className="text-xs text-gray-400">Current CSS Variables:</p>
					<pre className="text-xs mt-1 bg-black/50 p-2 rounded overflow-auto max-h-32 text-white">
						{`--warp-perspective: ${settings.perspective}px
--warp-size: ${settings.wrapSize}px
--warp-translate-z: ${settings.translateZ}px
--warp-duration: ${settings.animationSpeedDuration}s
--warp-delay: ${settings.animationSpeedDuration / 2}s`}
					</pre>
					<pre className="text-xs mt-1 bg-black/50 p-2 rounded overflow-auto max-h-32 text-white">
						{`--warp-base-hue-rotate: ${settings.baseHueRotate}deg
--warp-base-scale-x: ${settings.baseScaleX}
--warp-base-rotate-x: ${settings.baseRotateX}deg
--warp-base-rotate-y: ${settings.baseRotateY}deg
--warp-base-rotate-z: ${settings.baseRotateZ}deg
--warp-base-rotate-rate-z: ${settings.baseRotateRateZ}`}
					</pre>
				</div>
			</div>
		</div>
	);

	// Continuous mode - just show the warp scene directly
	if (continuous) {
		return (
			<div className="w-full h-screen overflow-hidden bg-black flex items-center justify-center">
				{controlsPanel}
				{warpScene}
			</div>
		);
	}

	// Transition mode - animated entrance/exit
	return (
		<AnimatePresence>
			{isActive && (
				<motion.div
					className="fixed inset-0 z-9000"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: settings.warpSceneFadeInDuration }}
				>
					{controlsPanel}

					{/* Black background that fades in */}
					<motion.div
						className="absolute inset-0 bg-black"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: settings.fadeToBlackDuration }}
					/>

					{/* Warp tunnel scene */}
					<motion.div
						className="absolute inset-0 flex items-center justify-center overflow-hidden"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{
							duration: settings.warpSceneFadeInDuration,
							delay: settings.fadeInTogether ? 0 : 0,
						}}
					>
						{warpScene}
					</motion.div>

					{/* Final fade to off-white background */}
					<motion.div
						className="absolute inset-0 pointer-events-none bg-off-white"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: settings.fadeOutDuration, delay: settings.animationDuration - settings.fadeOutDuration }}
					/>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
