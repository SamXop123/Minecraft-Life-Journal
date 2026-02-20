"use client";

import { motion } from "framer-motion";

/**
 * LanternGlow — soft warm radial light with subtle flicker.
 * Placed near top-right by default, configurable via props.
 * Uses only opacity animation for 60fps performance.
 */
export default function LanternGlow({
  top = "6%",
  right = "12%",
  size = 420,
}) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ top, right, width: size, height: size }}
      aria-hidden="true"
    >
      {/* Outer warm haze */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle, rgba(255,170,60,0.12) 0%, rgba(255,140,40,0.06) 35%, transparent 70%)",
        }}
        animate={{ opacity: [1, 0.82, 1, 0.9, 1] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Inner bright core */}
      <motion.div
        className="absolute"
        style={{
          top: "30%",
          left: "30%",
          width: "40%",
          height: "40%",
          background:
            "radial-gradient(circle, rgba(255,200,100,0.22) 0%, rgba(255,160,60,0.08) 50%, transparent 80%)",
        }}
        animate={{ opacity: [1, 0.7, 1, 0.85, 1] }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Lantern body (tiny pixel block) */}
      <div
        className="absolute"
        style={{
          top: "44%",
          left: "46%",
          width: 14,
          height: 18,
          backgroundColor: "#c28a3c",
          border: "2px solid #8a5a20",
          boxShadow: "0 0 12px 4px rgba(255,170,60,0.3)",
        }}
      >
        {/* Flame */}
        <motion.div
          style={{
            position: "absolute",
            top: 3,
            left: 2,
            width: 6,
            height: 8,
            backgroundColor: "#ffc040",
            boxShadow: "0 0 6px 2px rgba(255,200,80,0.6)",
          }}
          animate={{ opacity: [1, 0.65, 1, 0.8, 1] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Chain / mount line above lantern */}
      <div
        className="absolute"
        style={{
          top: "28%",
          left: "48.5%",
          width: 2,
          height: "16%",
          backgroundColor: "rgba(80,56,28,0.6)",
        }}
      />
    </div>
  );
}
