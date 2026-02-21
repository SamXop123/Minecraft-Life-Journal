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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
      <h1 className="text-4xl font-bold text-white">
        Minecraft Life Journal
      </h1>
    </div>
  );
}
