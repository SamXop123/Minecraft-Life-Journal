"use client";

import { motion } from "framer-motion";

/* ─── CSS-based wooden plank pattern ─── */
const PLANK_BG = `
  repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 46px,
    rgba(0,0,0,0.25) 46px,
    rgba(0,0,0,0.25) 48px
  ),
  repeating-linear-gradient(
    90deg,
    #5c3a1e 0px,
    #6b4226 12px,
    #5a371a 24px,
    #7a4f2e 36px,
    #644020 48px,
    #5c3a1e 60px
  )
`;

/* ─── Plank "grain" overlay — thin horizontal streaks ─── */
const GRAIN_BG = `
  repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 5px,
    rgba(0,0,0,0.06) 5px,
    rgba(0,0,0,0.06) 6px,
    transparent 6px,
    transparent 11px,
    rgba(0,0,0,0.04) 11px,
    rgba(0,0,0,0.04) 12px
  )
`;

/* ─── Pixel-style crafting table silhouette (left side) ─── */
function CraftingTableSilhouette() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ bottom: 0, left: "5%", opacity: 0.12 }}
      aria-hidden="true"
    >
      {/* Table top */}
      <div
        style={{
          width: 72,
          height: 8,
          backgroundColor: "#1a1008",
          position: "absolute",
          bottom: 56,
          left: -4,
        }}
      />
      {/* Body */}
      <div
        style={{
          width: 64,
          height: 56,
          backgroundColor: "#1a1008",
          position: "relative",
        }}
      />
      {/* Grid pattern on face (3x3) */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <div
            key={`ct-${row}-${col}`}
            style={{
              position: "absolute",
              bottom: 6 + row * 16,
              left: 8 + col * 16,
              width: 14,
              height: 14,
              backgroundColor: "#0e0904",
              opacity: 0.4,
            }}
          />
        ))
      )}
    </div>
  );
}

/* ─── Pixel-style chest silhouette (right side) ─── */
function ChestSilhouette() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ bottom: 0, right: "6%", opacity: 0.1 }}
      aria-hidden="true"
    >
      {/* Chest body */}
      <div style={{ width: 56, height: 40, backgroundColor: "#1a1008" }} />
      {/* Lid */}
      <div
        style={{
          width: 56,
          height: 14,
          backgroundColor: "#1a1008",
          position: "absolute",
          bottom: 40,
          borderRadius: "3px 3px 0 0",
        }}
      />
      {/* Latch */}
      <div
        style={{
          width: 8,
          height: 6,
          backgroundColor: "#0e0904",
          position: "absolute",
          bottom: 42,
          left: 24,
        }}
      />
    </div>
  );
}

export default function WoodenBaseScene() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">

      {/* ═══════════════════════════════════════
          LAYER 1 — WOODEN PLANK WALL
      ═══════════════════════════════════════ */}
      <div
        className="absolute inset-0"
        style={{ background: PLANK_BG }}
      />

      {/* Wood grain overlay */}
      <div
        className="absolute inset-0"
        style={{ background: GRAIN_BG }}
      />

      {/* Warm base wash — makes planks feel lit by a lantern */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 35%, rgba(255,180,80,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ═══════════════════════════════════════
          LAYER 2 — VIGNETTE + INTERIOR DEPTH
      ═══════════════════════════════════════ */}

      {/* Corner darkness — heavy vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 50% 45%, transparent 40%, rgba(10,6,2,0.55) 100%)",
        }}
      />

      {/* Extra top shadow (ceiling) */}
      <div
        className="absolute top-0 left-0 right-0 h-40"
        style={{
          background:
            "linear-gradient(to bottom, rgba(8,4,1,0.7) 0%, transparent 100%)",
        }}
      />

      {/* Extra bottom shadow (floor depth) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background:
            "linear-gradient(to top, rgba(8,4,1,0.6) 0%, transparent 100%)",
        }}
      />

      {/* Side shadow (left) */}
      <div
        className="absolute top-0 bottom-0 left-0 w-48"
        style={{
          background:
            "linear-gradient(to right, rgba(6,3,0,0.5) 0%, transparent 100%)",
        }}
      />

      {/* Side shadow (right) */}
      <div
        className="absolute top-0 bottom-0 right-0 w-48"
        style={{
          background:
            "linear-gradient(to left, rgba(6,3,0,0.5) 0%, transparent 100%)",
        }}
      />

      {/* ═══════════════════════════════════════
          LAYER 3 — NIGHT WINDOW HINTS
      ═══════════════════════════════════════ */}

      {/* Small "window" glow — suggesting night outside on top-left */}
      <div
        className="absolute"
        style={{
          top: "8%",
          left: "8%",
          width: 52,
          height: 64,
          background: "linear-gradient(135deg, #0b1a30 30%, #06101e 100%)",
          border: "3px solid #3a2510",
          opacity: 0.5,
        }}
      />
      {/* Starlight twinkle in window */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: "10%",
          left: "9.2%",
          width: 3,
          height: 3,
          backgroundColor: "#c8d8ff",
        }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ═══════════════════════════════════════
          LAYER 4 — FOREGROUND SILHOUETTES
      ═══════════════════════════════════════ */}
      <CraftingTableSilhouette />
      <ChestSilhouette />

      {/* Floor plank darker strip */}
      <div
        className="absolute bottom-0 left-0 right-0 h-6"
        style={{ backgroundColor: "rgba(20,12,5,0.7)" }}
      />
    </div>
  );
}
