"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

interface LightWarpButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * A button wrapper with continuous light warp effect - star streaks
 * zooming past in white, blue, and green with dusty sparkles.
 */
export function LightWarpButton({ children, className, onClick }: LightWarpButtonProps) {
  // Generate random positions for star streaks
  const starStreaks = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    top: `${5 + Math.random() * 90}%`,
    delay: i * 0.15,
    duration: 1.2 + Math.random() * 0.8,
    color: i % 3 === 0 ? "white" : i % 3 === 1 ? "#60a5fa" : "#4ade80",
    height: 1 + Math.random() * 2,
  }));

  // Dusty sparkle particles
  const dustParticles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    size: 1 + Math.random() * 3,
    color: i % 4 === 0 ? "white" : i % 4 === 1 ? "#93c5fd" : i % 4 === 2 ? "#86efac" : "#e0e7ff",
  }));

  return (
    <div className={cn("relative", className)} onClick={onClick}>
      {/* Light warp container */}
      <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
        {/* Radial glow background pulse */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: "radial-gradient(ellipse at center, rgba(96, 165, 250, 0.15) 0%, rgba(74, 222, 128, 0.05) 40%, transparent 70%)",
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Star streaks - horizontal light warp lines */}
        {starStreaks.map((streak) => (
          <motion.div
            key={streak.id}
            className="absolute h-[2px] rounded-full"
            style={{
              top: streak.top,
              left: "-20%",
              width: "40%",
              height: `${streak.height}px`,
              background: `linear-gradient(90deg, transparent, ${streak.color}, ${streak.color}, transparent)`,
              filter: "blur(1px)",
              boxShadow: `0 0 10px 2px ${streak.color === "white" ? "rgba(255,255,255,0.6)" : streak.color === "#60a5fa" ? "rgba(96, 165, 250, 0.6)" : "rgba(74, 222, 128, 0.5)"}`,
            }}
            animate={{
              x: ["-100%", "400%"],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: streak.duration,
              repeat: Infinity,
              ease: "easeOut",
              delay: streak.delay,
            }}
          />
        ))}

        {/* Dusty sparkle particles */}
        {dustParticles.map((particle) => (
          <motion.div
            key={`dust-${particle.id}`}
            className="absolute rounded-full"
            style={{
              top: particle.top,
              left: particle.left,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: particle.color,
              filter: "blur(0.5px)",
              boxShadow: `0 0 ${particle.size * 2}px ${particle.size}px ${particle.color}`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.2, 0.5],
              x: [0, (particle.id % 2 === 0 ? 15 : -15)],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay,
            }}
          />
        ))}

        {/* Central glow burst */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Edge glow - top */}
        <motion.div
          className="absolute top-0 left-[10%] right-[10%] h-[1px]"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(147, 197, 253, 0.8), rgba(255,255,255,0.9), rgba(134, 239, 172, 0.8), transparent)",
            filter: "blur(2px)",
            boxShadow: "0 0 15px 3px rgba(255,255,255,0.3)",
          }}
          animate={{
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Edge glow - bottom */}
        <motion.div
          className="absolute bottom-0 left-[10%] right-[10%] h-[1px]"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(134, 239, 172, 0.8), rgba(255,255,255,0.9), rgba(147, 197, 253, 0.8), transparent)",
            filter: "blur(2px)",
            boxShadow: "0 0 15px 3px rgba(255,255,255,0.3)",
          }}
          animate={{
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.25,
          }}
        />
      </div>

      {/* Button content with subtle hover effect */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
