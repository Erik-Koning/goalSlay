"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

interface WarpBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  /** Number of beams per side */
  beamsPerSide?: number;
  /** Size/thickness of beams in pixels */
  beamSize?: number;
  /** Duration of beam animation in seconds */
  beamDuration?: number;
  /** Delay multiplier between beams */
  beamDelayMultiplier?: number;
  /** Perspective depth */
  perspective?: number;
  /** Whether animation is active */
  isActive?: boolean;
  /** Beam colors - white, blue, green theme */
  colors?: string[];
}

/**
 * WarpBackground creates a hyperspace/warp speed effect with light beams
 * streaming towards the viewer from a central vanishing point.
 */
export function WarpBackground({
  children,
  className,
  beamsPerSide = 8,
  beamSize = 3,
  beamDuration = 1.5,
  beamDelayMultiplier = 0.1,
  perspective = 400,
  isActive = true,
  colors = ["#ffffff", "#60a5fa", "#4ade80", "#93c5fd", "#86efac"],
}: WarpBackgroundProps) {
  // Generate beams for all four sides
  const beams = useMemo(() => {
    const allBeams: Array<{
      id: string;
      side: "top" | "bottom" | "left" | "right";
      position: number;
      color: string;
      delay: number;
      duration: number;
    }> = [];

    const sides: Array<"top" | "bottom" | "left" | "right"> = ["top", "bottom", "left", "right"];

    sides.forEach((side) => {
      for (let i = 0; i < beamsPerSide; i++) {
        const position = ((i + 0.5) / beamsPerSide) * 100;
        const colorIndex = (i + sides.indexOf(side) * 2) % colors.length;

        allBeams.push({
          id: `${side}-${i}`,
          side,
          position,
          color: colors[colorIndex],
          delay: (i * beamDelayMultiplier) + (sides.indexOf(side) * 0.05),
          duration: beamDuration + (Math.random() * 0.5 - 0.25),
        });
      }
    });

    return allBeams;
  }, [beamsPerSide, beamDelayMultiplier, beamDuration, colors]);

  // Generate dust/sparkle particles
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      delay: Math.random() * 2,
      duration: 1.5 + Math.random() * 1,
      color: colors[i % colors.length],
    }));
  }, [colors]);

  return (
    <div
      className={cn("relative w-full h-full overflow-hidden", className)}
      style={{ perspective: `${perspective}px` }}
    >
      {/* Warp effect container */}
      {isActive && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Central glow/vanishing point */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 20,
              height: 20,
              background: "radial-gradient(circle, white 0%, rgba(96, 165, 250, 0.8) 30%, transparent 70%)",
              boxShadow: "0 0 60px 20px rgba(255,255,255,0.4), 0 0 120px 40px rgba(96, 165, 250, 0.3)",
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Light beams from edges towards center (reversed = towards viewer) */}
          {beams.map((beam) => {
            const isHorizontal = beam.side === "left" || beam.side === "right";
            const isStartSide = beam.side === "left" || beam.side === "top";

            const baseStyle: React.CSSProperties = {
              position: "absolute",
              background: `linear-gradient(${isHorizontal ? "90deg" : "0deg"}, transparent, ${beam.color} 20%, ${beam.color} 80%, transparent)`,
              filter: "blur(1px)",
              boxShadow: `0 0 ${beamSize * 4}px ${beamSize}px ${beam.color}`,
            };

            if (isHorizontal) {
              Object.assign(baseStyle, {
                top: `${beam.position}%`,
                height: `${beamSize}px`,
                width: "50%",
                [beam.side]: 0,
                transformOrigin: beam.side === "left" ? "left center" : "right center",
              });
            } else {
              Object.assign(baseStyle, {
                left: `${beam.position}%`,
                width: `${beamSize}px`,
                height: "50%",
                [beam.side]: 0,
                transformOrigin: beam.side === "top" ? "center top" : "center bottom",
              });
            }

            return (
              <motion.div
                key={beam.id}
                style={baseStyle}
                initial={{
                  scaleX: isHorizontal ? 0 : 1,
                  scaleY: isHorizontal ? 1 : 0,
                  opacity: 0,
                }}
                animate={{
                  scaleX: isHorizontal ? [0, 1.2, 1.5] : 1,
                  scaleY: isHorizontal ? 1 : [0, 1.2, 1.5],
                  opacity: [0, 1, 0.8, 0],
                  [isHorizontal ? "x" : "y"]: isStartSide
                    ? ["0%", "30%", "80%"]
                    : ["0%", "-30%", "-80%"],
                }}
                transition={{
                  duration: beam.duration,
                  delay: beam.delay,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            );
          })}

          {/* Dust particles flying towards viewer */}
          {particles.map((particle) => (
            <motion.div
              key={`particle-${particle.id}`}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
                background: particle.color,
                boxShadow: `0 0 ${particle.size * 3}px ${particle.size}px ${particle.color}`,
              }}
              animate={{
                scale: [0.5, 2, 3],
                opacity: [0, 1, 0],
                z: [0, 100, 200],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Perspective grid lines (optional depth effect) */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 50% 50%, transparent 0%, transparent 30%, rgba(96, 165, 250, 0.03) 60%, transparent 100%)
              `,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      )}

      {/* Children content */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
