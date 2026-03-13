"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
// import WalkingSteve from "@/components/WalkingSteve";


/* ─── Constants ─── */
const CYCLE = 60; // Full day-night cycle in seconds
/* ─── Pre-computed data (module-level, zero re-render cost) ─── */
const stars = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: `${(i * 41 + 17) % 100}%`,
  top: `${(i * 29 + 11) % 55}%`,
  size: i % 5 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1,
}));

const grassBlocks = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  height: 6 + (((i * 7 + 3) % 5) * 3),
}));

/*
  Orbit timing reference:
  ┌──────────┬────────┬────────────────────┐
  │ % cycle  │ time   │ phase              │
  ├──────────┼────────┼────────────────────┤
  │   0%     │  0 s   │ Sunrise  (left)    │
  │  25%     │ 15 s   │ Noon     (top)     │
  │  50%     │ 30 s   │ Sunset   (right)   │
  │  75%     │ 45 s   │ Midnight (bottom)  │
  │ 100%     │ 60 s   │ Sunrise  (loop)    │
  └──────────┴────────┴────────────────────┘
*/

/* ─── Elliptical orbit keyframes (pre-computed, zero distortion) ─── */
const ORBIT_RX = 46;  // vw — horizontal radius (near edge-to-edge)
const ORBIT_RY = 46;  // vh — vertical radius (tall cinematic arc)
const ORBIT_STEPS = 60;

const sunX = [];
const sunY = [];
const moonX = [];
const moonY = [];

for (let i = 0; i <= ORBIT_STEPS; i++) {
  const angle = (i / ORBIT_STEPS) * 2 * Math.PI;
  // Sun: starts left → top → right → bottom → left
  sunX.push(`${(-ORBIT_RX * Math.cos(angle)).toFixed(2)}vw`);
  sunY.push(`${(-ORBIT_RY * Math.sin(angle)).toFixed(2)}vh`);
  // Moon: 180° opposite
  moonX.push(`${(ORBIT_RX * Math.cos(angle)).toFixed(2)}vw`);
  moonY.push(`${(ORBIT_RY * Math.sin(angle)).toFixed(2)}vh`);
}

const orbitTransition = {
  duration: CYCLE,
  repeat: Infinity,
  ease: "linear",
};

export default function Home() {

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030609]">

      {/* ═══════════════════════════════════════
          LAYER A — ANIMATED SKY GRADIENTS
      ═══════════════════════════════════════ */}

      {/* Night sky base (always present) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 90% at 50% 20%, #0a1628 0%, #060d18 50%, #030609 100%)",
        }}
      />

      {/* Day sky — peaks at noon (25%), zero during night half */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #1a3a5c 0%, #2563a8 30%, #4a90c4 55%, #7ab8d4 80%, #b0d8e8 100%)",
        }}
        animate={{
          opacity: [0.15, 0.5, 0.85, 1, 0.85, 0.5, 0.15, 0, 0, 0, 0.05, 0.15],
        }}
        transition={{
          duration: CYCLE,
          times:   [0, 0.08, 0.17, 0.25, 0.33, 0.42, 0.50, 0.58, 0.75, 0.88, 0.95, 1],
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Sunrise / Sunset warm overlay — peaks at 0% (sunrise) and 50% (sunset) */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #d4553a 0%, #e87840 25%, #c2444d 50%, #6b2040 80%, transparent 100%)",
        }}
        animate={{
          opacity: [0.5, 0.25, 0, 0, 0, 0.25, 0.5, 0.25, 0, 0, 0, 0.25, 0.5],
        }}
        transition={{
          duration: CYCLE,
          times:   [0, 0.08, 0.17, 0.25, 0.33, 0.42, 0.50, 0.58, 0.67, 0.75, 0.83, 0.92, 1],
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Horizon glow — warm pulse at sunrise / sunset */}
      <motion.div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: "65%",
          height: "25%",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,140,50,0.25), transparent 70%)",
        }}
        animate={{
          opacity: [0.7, 0.35, 0, 0, 0, 0.35, 0.7, 0.35, 0, 0, 0, 0.35, 0.7],
        }}
        transition={{
          duration: CYCLE,
          times:   [0, 0.08, 0.17, 0.25, 0.33, 0.42, 0.50, 0.58, 0.67, 0.75, 0.83, 0.92, 1],
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* ═══════════════════════════════════════
          LAYER D — STARS (fade in at night)
      ═══════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0"
        aria-hidden="true"
        animate={{
          opacity: [0.2, 0.05, 0, 0, 0, 0.05, 0.2, 0.5, 0.8, 1, 0.8, 0.5, 0.2],
        }}
        transition={{
          duration: CYCLE,
          times:   [0, 0.08, 0.15, 0.25, 0.35, 0.42, 0.50, 0.58, 0.67, 0.75, 0.83, 0.92, 1],
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {stars.map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 2.5 + (s.id % 4),
              delay: (s.id % 7) * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* ═══════════════════════════════════════
          LAYERS B & C — SUN & MOON ORBIT
          Keyframe-based elliptical path.
          No scaleY — zero distortion.
          Orbit center sits near the ground line.
      ═══════════════════════════════════════ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Orbit origin — horizontally centered, near ground level */}
        <div className="absolute left-1/2 bottom-[10%]" style={{ width: 0, height: 0 }}>

          {/* ── Sun ── */}
          <motion.div
            className="absolute"
            style={{ width: 80, height: 80, marginLeft: -40, marginTop: -40 }}
            animate={{ x: sunX, y: sunY }}
            transition={orbitTransition}
          >
            {/* Outer corona — slow pulse */}
            <motion.div
              className="absolute inset-0 rounded-sm pointer-events-none"
              style={{
                background: "transparent",
                boxShadow:
                  "0 0 80px 36px rgba(255,200,40,0.35), 0 0 180px 80px rgba(255,160,0,0.15)",
              }}
              animate={{ opacity: [0.75, 1, 0.75], scale: [0.97, 1.03, 0.97] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Inner warm haze */}
            <div
              className="absolute"
              style={{
                inset: -16,
                borderRadius: 4,
                background:
                  "radial-gradient(circle, rgba(255,230,120,0.28) 0%, rgba(255,160,0,0.12) 50%, transparent 75%)",
                pointerEvents: "none",
              }}
            />
            {/* The actual pixel-art sun image */}
            <img
              src="/sun.png"
              alt="Sun"
              width={80}
              height={80}
              draggable={false}
              style={{
                imageRendering: "pixelated",
                width: 80,
                height: 80,
                display: "block",
                filter:
                  "drop-shadow(0 0 12px rgba(255,200,60,0.9)) drop-shadow(0 0 28px rgba(255,140,0,0.6)) brightness(1.08)",
              }}
            />
          </motion.div>

          {/* ── Moon ── */}
          <motion.div
            className="absolute"
            style={{ width: 64, height: 64, marginLeft: -32, marginTop: -32 }}
            animate={{ x: moonX, y: moonY }}
            transition={orbitTransition}
          >
            {/* Outer moonlight halo — slow pulse */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: 4,
                background: "transparent",
                boxShadow:
                  "0 0 60px 24px rgba(180,210,255,0.22), 0 0 130px 60px rgba(160,200,255,0.09)",
              }}
              animate={{ opacity: [0.6, 1, 0.6], scale: [0.96, 1.04, 0.96] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Cool blue ambient haze */}
            <div
              className="absolute"
              style={{
                inset: -14,
                borderRadius: 4,
                background:
                  "radial-gradient(circle, rgba(200,225,255,0.18) 0%, rgba(160,200,255,0.07) 55%, transparent 75%)",
                pointerEvents: "none",
              }}
            />
            {/* The actual pixel-art moon image */}
            <img
              src="/moon.png"
              alt="Moon"
              width={64}
              height={64}
              draggable={false}
              style={{
                imageRendering: "pixelated",
                width: 64,
                height: 64,
                display: "block",
                filter:
                  "drop-shadow(0 0 10px rgba(180,215,255,0.85)) drop-shadow(0 0 24px rgba(140,190,255,0.5)) brightness(1.05)",
              }}
            />
          </motion.div>

        </div>
      </div>

      {/* ═══════════════════════════════════════
          FOG & GROUND
      ═══════════════════════════════════════ */}

      {/* Bottom fog gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(10,20,15,0.9) 0%, rgba(10,20,15,0.4) 40%, transparent 100%)",
        }}
      />

      {/* Depth shadow above grass */}
      <div
        className="absolute bottom-[52px] left-0 right-0 h-4 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
        }}
      />

      {/* Walking Steve */}
      {/* <WalkingSteve /> */}

      {/* Pixel-style grass strip */}
      <div
        className="absolute bottom-[28px] left-0 right-0 flex"
        aria-hidden="true"
      >
        {grassBlocks.map((b) => (
          <div key={b.id} className="flex-1" style={{ height: b.height }}>
            <div className="w-full h-full bg-[#3a7d44]" />
          </div>
        ))}
      </div>

      {/* Grass surface line */}
      <div className="absolute bottom-[28px] left-0 right-0 h-[3px] bg-[#4caf50]" />

      {/* Dirt strip + darker accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[28px] bg-[#5c3a21]" />
      <div className="absolute bottom-0 left-0 right-0 h-[10px] bg-[#3e2714]" />

      {/* ═══════════════════════════════════════
          HERO CONTENT
      ═══════════════════════════════════════ */}

      {/* Dark vignette behind text for readability at all sky states */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 45%, rgba(0,0,0,0.35) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center pb-24">

        {/* Title */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-5 leading-tight"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <span
            className="block text-green-400"
            style={{
              textShadow:
                "0 0 20px rgba(74,222,128,0.35), 0 0 60px rgba(74,222,128,0.15)",
            }}
          >
            Minecraft
          </span>
          <span
            className="block text-white"
            style={{
              textShadow: "0 0 30px rgba(255,255,255,0.08)",
            }}
          >
            Life Journal
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-lg mb-3 font-medium"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
        >
          Preserve the worlds that mattered.
        </motion.p>

        {/* Microcopy */}
        <motion.p
          className="text-sm sm:text-base text-gray-400 max-w-md mb-12 tracking-wide"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: "easeOut" }}
        >
          Every diamond. Every death. Every world.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: "easeOut" }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link
              href="/register"
              className="inline-block px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-xl text-center shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_30px_rgba(16,185,129,0.45)] transition-all duration-200"
            >
              Get Started
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link
              href="/login"
              className="inline-block px-10 py-4 bg-gray-800/70 hover:bg-gray-700/80 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-bold text-lg rounded-xl text-center shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.5)] transition-all duration-200"
            >
              Login
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
