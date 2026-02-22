"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

/* ─── Constants ─── */
const CYCLE = 60; // Full day-night cycle in seconds
const AUDIO_KEY = "mlj-ambient-audio";
const AUDIO_VOLUME = 0.2;

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
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  // Lazily create the Audio element once (avoids SSR issues)
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio("/ambient.mp3");
      a.loop = true;
      a.volume = AUDIO_VOLUME;
      
      // Add error handler
      a.addEventListener("error", (e) => {
        console.error("Audio loading error:", e);
        console.error("Audio error code:", a.error?.code);
        console.error("Audio error message:", a.error?.message);
      });
      
      // Track loading state
      a.addEventListener("loadeddata", () => {
        console.log("Audio loaded successfully");
      });
      
      a.addEventListener("canplaythrough", () => {
        console.log("Audio ready to play");
      });
      
      audioRef.current = a;
      console.log("Audio element created");
    }
    return audioRef.current;
  }, []);

  // On mount: if user previously enabled audio, mark state but do NOT autoplay.
  // Browsers block play() without user gesture, so we just restore the visual
  // state and wait for the first click to actually start playback.
  useEffect(() => {
    const saved = localStorage.getItem(AUDIO_KEY);
    if (saved === "on") setPlaying(true);

    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // When the user has interacted and `playing` was restored from localStorage,
  // the first click will call toggleAudio which handles play. But we also need
  // to handle the edge-case where state was restored as true — we attempt play
  // on the first user interaction with the page.
  useEffect(() => {
    if (!playing) return;

    const tryPlay = () => {
      const audio = getAudio();
      audio.play().catch(() => {});
      window.removeEventListener("click", tryPlay);
      window.removeEventListener("keydown", tryPlay);
    };

    // Attempt immediately (works if already had gesture)
    const audio = getAudio();
    const p = audio.play();
    if (p && p.catch) {
      p.catch(() => {
        // Blocked — wait for any user gesture
        window.addEventListener("click", tryPlay, { once: true });
        window.addEventListener("keydown", tryPlay, { once: true });
      });
    }

    return () => {
      window.removeEventListener("click", tryPlay);
      window.removeEventListener("keydown", tryPlay);
    };
  }, [playing, getAudio]);

  const toggleAudio = () => {
    console.log("Toggle clicked, current playing state:", playing);
    const audio = getAudio();
    console.log("Audio element:", audio);
    console.log("Audio src:", audio.src);
    console.log("Audio readyState:", audio.readyState);
    
    if (playing) {
      audio.pause();
      setPlaying(false);
      localStorage.setItem(AUDIO_KEY, "off");
      console.log("Audio paused");
    } else {
      audio.play()
        .then(() => {
          console.log("Audio playing successfully");
        })
        .catch((error) => {
          console.error("Audio play error:", error);
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
        });
      setPlaying(true);
      localStorage.setItem(AUDIO_KEY, "on");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030609]">

      {/* ═══════════════════════════════════════
          AMBIENT AUDIO TOGGLE
      ═══════════════════════════════════════ */}
      <button
        onClick={toggleAudio}
        aria-label={playing ? "Mute ambient sound" : "Play ambient sound"}
        className="fixed top-5 right-5 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-lg cursor-pointer select-none hover:bg-white/20 hover:shadow-[0_0_16px_rgba(255,255,255,0.12)] transition-all duration-200"
      >
        {playing ? "\uD83D\uDD0A" : "\uD83D\uDD07"}
      </button>

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

    </div>
  );
}
