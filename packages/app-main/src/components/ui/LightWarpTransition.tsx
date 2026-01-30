"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface LightWarpPageTransitionProps {
  children: React.ReactNode;
  targetUrl: string;
  /** Element that triggers the transition on click */
  triggerClassName?: string;
}

/**
 * Wraps entire page content and triggers a full-screen light warp transition.
 * The effect shows light streaks warping towards the viewer before navigating.
 */
export function LightWarpTransition({ children, targetUrl }: LightWarpPageTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [phase, setPhase] = useState<"idle" | "fadeToBlack" | "warp" | "fadeToWhite">("idle");
  const router = useRouter();

  const triggerTransition = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setPhase("fadeToBlack");

    // Phase 1: Fade to black (0.5s)
    setTimeout(() => {
      setPhase("warp");
    }, 500);

    // Phase 2: Light warp effect (2s)
    setTimeout(() => {
      setPhase("fadeToWhite");
    }, 2500);

    // Phase 3: Fade to background and navigate (0.4s)
    setTimeout(() => {
      router.push(targetUrl);
    }, 2900);
  }, [isTransitioning, router, targetUrl]);

  // Warp beams configuration - similar style to button streaks
  const warpBeams = useMemo(() => {
    const beams: Array<{
      id: number;
      side: "top" | "bottom" | "left" | "right";
      position: number;
      color: string;
      delay: number;
      duration: number;
      thickness: number;
    }> = [];

    const colors = ["#ffffff", "#60a5fa", "#4ade80", "#93c5fd", "#86efac", "#e0f2fe"];
    const sides: Array<"top" | "bottom" | "left" | "right"> = ["top", "bottom", "left", "right"];
    const beamsPerSide = 12;

    sides.forEach((side, sideIndex) => {
      for (let i = 0; i < beamsPerSide; i++) {
        beams.push({
          id: sideIndex * beamsPerSide + i,
          side,
          position: 5 + (i / beamsPerSide) * 90,
          color: colors[(i + sideIndex) % colors.length],
          delay: i * 0.08 + sideIndex * 0.05,
          duration: 1.2 + Math.random() * 0.6,
          thickness: 2 + Math.random() * 3,
        });
      }
    });

    return beams;
  }, []);

  // Dust particles
  const dustParticles = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      startX: 50 + (Math.random() - 0.5) * 20,
      startY: 50 + (Math.random() - 0.5) * 20,
      angle: Math.random() * 360,
      distance: 60 + Math.random() * 40,
      delay: Math.random() * 0.8,
      duration: 1.5 + Math.random() * 1,
      size: 1 + Math.random() * 4,
      color: ["#ffffff", "#93c5fd", "#86efac", "#e0e7ff"][i % 4],
    }));
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Page content with click handler passed via context or props */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ onWarpTrigger?: () => void }>, {
            onWarpTrigger: triggerTransition,
          });
        }
        return child;
      })}

      {/* Full-screen transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Black background for fade and warp phases */}
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{
                opacity: phase === "fadeToBlack" || phase === "warp" ? 1 : 0,
              }}
              transition={{ duration: 0.5 }}
            />

            {/* White/background color for final phase */}
            <motion.div
              className="absolute inset-0"
              style={{ backgroundColor: "oklch(0.9940 0 0)" }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: phase === "fadeToWhite" ? 1 : 0,
              }}
              transition={{ duration: 0.4 }}
            />

            {/* WARP EFFECT */}
            {phase === "warp" && (
              <div className="absolute inset-0 overflow-hidden" style={{ perspective: "800px" }}>
                {/* Central vanishing point glow */}
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: 30,
                    height: 30,
                    background: "radial-gradient(circle, white 0%, rgba(96, 165, 250, 0.9) 40%, transparent 70%)",
                    boxShadow: "0 0 80px 40px rgba(255,255,255,0.6), 0 0 150px 80px rgba(96, 165, 250, 0.4), 0 0 200px 100px rgba(74, 222, 128, 0.2)",
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 2, 4], opacity: [0, 1, 0.9] }}
                  transition={{ duration: 1.8, ease: "easeOut" }}
                />

                {/* Light beams streaming from edges towards center (visually towards viewer) */}
                {warpBeams.map((beam) => {
                  const isHorizontal = beam.side === "left" || beam.side === "right";

                  const style: React.CSSProperties = {
                    position: "absolute",
                    background: `linear-gradient(${isHorizontal ? (beam.side === "left" ? "90deg" : "270deg") : (beam.side === "top" ? "180deg" : "0deg")},
                      transparent 0%,
                      ${beam.color} 15%,
                      ${beam.color} 85%,
                      transparent 100%)`,
                    filter: "blur(1px)",
                    boxShadow: `0 0 ${beam.thickness * 4}px ${beam.thickness}px ${beam.color}`,
                  };

                  if (isHorizontal) {
                    Object.assign(style, {
                      top: `${beam.position}%`,
                      height: `${beam.thickness}px`,
                      width: "55%",
                      [beam.side]: 0,
                    });
                  } else {
                    Object.assign(style, {
                      left: `${beam.position}%`,
                      width: `${beam.thickness}px`,
                      height: "55%",
                      [beam.side]: 0,
                    });
                  }

                  const moveAxis = isHorizontal ? "x" : "y";
                  const moveDirection = beam.side === "left" || beam.side === "top" ? 1 : -1;

                  return (
                    <motion.div
                      key={beam.id}
                      style={style}
                      initial={{
                        opacity: 0,
                        scale: 0.3,
                      }}
                      animate={{
                        opacity: [0, 1, 1, 0],
                        scale: [0.3, 1, 1.5, 2],
                        [moveAxis]: [`0%`, `${moveDirection * 20}%`, `${moveDirection * 50}%`],
                      }}
                      transition={{
                        duration: beam.duration,
                        delay: beam.delay,
                        ease: "easeOut",
                      }}
                    />
                  );
                })}

                {/* Dust/sparkle particles flying towards viewer */}
                {dustParticles.map((particle) => {
                  const radians = (particle.angle * Math.PI) / 180;
                  const endX = Math.cos(radians) * particle.distance;
                  const endY = Math.sin(radians) * particle.distance;

                  return (
                    <motion.div
                      key={`dust-${particle.id}`}
                      className="absolute rounded-full"
                      style={{
                        left: `${particle.startX}%`,
                        top: `${particle.startY}%`,
                        width: particle.size,
                        height: particle.size,
                        background: particle.color,
                        boxShadow: `0 0 ${particle.size * 4}px ${particle.size * 2}px ${particle.color}`,
                      }}
                      initial={{
                        x: 0,
                        y: 0,
                        scale: 0,
                        opacity: 0
                      }}
                      animate={{
                        x: `${endX}vw`,
                        y: `${endY}vh`,
                        scale: [0, 1.5, 2.5, 3],
                        opacity: [0, 1, 0.9, 0],
                      }}
                      transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        ease: "easeOut",
                      }}
                    />
                  );
                })}

                {/* Expanding ring pulses */}
                {[0, 0.3, 0.6].map((delay, i) => (
                  <motion.div
                    key={`ring-${i}`}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                    style={{
                      width: "10vw",
                      height: "10vw",
                      borderColor: i === 0 ? "rgba(255,255,255,0.6)" : i === 1 ? "rgba(96, 165, 250, 0.5)" : "rgba(74, 222, 128, 0.4)",
                      boxShadow: `0 0 20px 5px ${i === 0 ? "rgba(255,255,255,0.3)" : i === 1 ? "rgba(96, 165, 250, 0.3)" : "rgba(74, 222, 128, 0.2)"}`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 8, 20], opacity: [0, 0.8, 0] }}
                    transition={{ duration: 1.6, ease: "easeOut", delay }}
                  />
                ))}

                {/* Radial speed lines overlay */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      radial-gradient(circle at 50% 50%,
                        transparent 0%,
                        transparent 10%,
                        rgba(96, 165, 250, 0.05) 30%,
                        rgba(74, 222, 128, 0.05) 50%,
                        rgba(255,255,255, 0.03) 70%,
                        transparent 100%
                      )
                    `,
                  }}
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ opacity: [0, 0.8, 0.5], scale: [1, 1.3, 2] }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

