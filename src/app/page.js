"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ChevronDown,
  BookOpen,
  Terminal,
  Camera,
  Trophy,
  MapPin,
  Share2,
  ArrowRight,
  Activity,
  User,
  ExternalLink,
} from "lucide-react";
import PixelParticles from "@/components/PixelParticles";

/* ─── Constants ─── */
const CYCLE = 60; // Full day-night cycle in seconds

/* ─── Pre-computed data ─── */
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

/* Elliptical orbit keyframes */
const ORBIT_RX = 46;
const ORBIT_RY = 46;
const ORBIT_STEPS = 60;

const sunX = [];
const sunY = [];
const moonX = [];
const moonY = [];

for (let i = 0; i <= ORBIT_STEPS; i++) {
  const angle = (i / ORBIT_STEPS) * 2 * Math.PI;
  sunX.push(`${(-ORBIT_RX * Math.cos(angle)).toFixed(2)}vw`);
  sunY.push(`${(-ORBIT_RY * Math.sin(angle)).toFixed(2)}vh`);
  moonX.push(`${(ORBIT_RX * Math.cos(angle)).toFixed(2)}vw`);
  moonY.push(`${(ORBIT_RY * Math.sin(angle)).toFixed(2)}vh`);
}

const orbitTransition = {
  duration: CYCLE,
  repeat: Infinity,
  ease: "linear",
};

/* ─── Custom Font and Button Styles ─── */
const vt323 = { fontFamily: "'VT323', monospace" };
const silkscreen = { fontFamily: "'Silkscreen', sans-serif" };

const mcPrimaryButton = {
  backgroundColor: "#1b7a43",
  color: "#ffffff",
  borderTop: "3px solid #34c759",
  borderLeft: "3px solid #34c759",
  borderBottom: "3px solid #0f4c27",
  borderRight: "3px solid #0f4c27",
  boxShadow: "0 4px 0 #0c361c, 0 8px 16px rgba(0,0,0,0.5)",
  textShadow: "0 2px 4px rgba(0,0,0,0.8)",
  borderRadius: "8px",
};

const mcSecondaryButton = {
  backgroundColor: "#4a4a4a",
  color: "#ffffff",
  borderTop: "3px solid #7a7a7a",
  borderLeft: "3px solid #7a7a7a",
  borderBottom: "3px solid #2d2d2d",
  borderRight: "3px solid #2d2d2d",
  boxShadow: "0 4px 0 #1f1f1f, 0 8px 16px rgba(0,0,0,0.5)",
  textShadow: "0 2px 4px rgba(0,0,0,0.8)",
  borderRadius: "8px",
};

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden scroll-smooth bg-[#030609]">
      {/* ═══════════════════════════════════════
          LAYER 0 — FIXED BACKGROUND (CINEMATIC SUN/MOON ORBIT)
      ═══════════════════════════════════════ */}
      <div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        style={{ opacity: Math.max(0.15, 1 - scrollY / 600) }}
      >
        {/* Night sky base */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 130% 90% at 50% 20%, #0a1628 0%, #060d18 50%, #030609 100%)",
          }}
        />

        {/* Day sky */}
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
            times: [0, 0.08, 0.17, 0.25, 0.33, 0.42, 0.50, 0.58, 0.75, 0.88, 0.95, 1],
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Sunrise / Sunset overlay */}
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
            times: [0, 0.08, 0.17, 0.25, 0.33, 0.42, 0.50, 0.58, 0.67, 0.75, 0.83, 0.92, 1],
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Horizon glow */}
        <motion.div
          className="absolute left-0 right-0"
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
            times: [0, 0.08, 0.17, 0.25, 0.33, 0.42, 0.50, 0.58, 0.67, 0.75, 0.83, 0.92, 1],
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Stars */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: [0.2, 0.05, 0, 0, 0, 0.05, 0.2, 0.5, 0.8, 1, 0.8, 0.5, 0.2],
          }}
          transition={{
            duration: CYCLE,
            times: [0, 0.08, 0.15, 0.25, 0.35, 0.42, 0.50, 0.58, 0.67, 0.75, 0.83, 0.92, 1],
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

        {/* Sun & Moon Orbit */}
        <div className="absolute left-1/2 bottom-[10%]" style={{ width: 0, height: 0 }}>
          {/* Sun */}
          <motion.div
            className="absolute"
            style={{ width: 80, height: 80, marginLeft: -40, marginTop: -40 }}
            animate={{ x: sunX, y: sunY }}
            transition={orbitTransition}
          >
            <motion.div
              className="absolute inset-0 rounded-sm"
              style={{
                boxShadow:
                  "0 0 80px 36px rgba(255,200,40,0.35), 0 0 180px 80px rgba(255,160,0,0.15)",
              }}
              animate={{ opacity: [0.75, 1, 0.75], scale: [0.97, 1.03, 0.97] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <img
              src="/sun.png"
              alt="Sun"
              width={80}
              height={80}
              style={{
                imageRendering: "pixelated",
                filter:
                  "drop-shadow(0 0 12px rgba(255,200,60,0.9)) drop-shadow(0 0 28px rgba(255,140,0,0.6)) brightness(1.08)",
              }}
            />
          </motion.div>

          {/* Moon */}
          <motion.div
            className="absolute"
            style={{ width: 64, height: 64, marginLeft: -32, marginTop: -32 }}
            animate={{ x: moonX, y: moonY }}
            transition={orbitTransition}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                boxShadow:
                  "0 0 60px 24px rgba(180,210,255,0.22), 0 0 130px 60px rgba(160,200,255,0.09)",
              }}
              animate={{ opacity: [0.6, 1, 0.6], scale: [0.96, 1.04, 0.96] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <img
              src="/moon.png"
              alt="Moon"
              width={64}
              height={64}
              style={{
                imageRendering: "pixelated",
                filter:
                  "drop-shadow(0 0 10px rgba(180,215,255,0.85)) drop-shadow(0 0 24px rgba(140,190,255,0.5)) brightness(1.05)",
              }}
            />
          </motion.div>
        </div>

        {/* Spores/Particles floating */}
        <PixelParticles count={15} />

        {/* Grass surface line & blocks at bottom */}
        <div className="absolute bottom-[28px] left-0 right-0 flex">
          {grassBlocks.map((b) => (
            <div key={b.id} className="flex-1" style={{ height: b.height }}>
              <div className="w-full h-full bg-[#3a7d44]" />
            </div>
          ))}
        </div>
        <div className="absolute bottom-[28px] left-0 right-0 h-[3px] bg-[#4caf50]" />
        <div className="absolute bottom-0 left-0 right-0 h-[28px] bg-[#5c3a21]" />
        <div className="absolute bottom-0 left-0 right-0 h-[10px] bg-[#3e2714]" />
      </div>

      {/* ═══════════════════════════════════════
          LAYER 1 — SCROLLABLE LAYER (z-10)
      ═══════════════════════════════════════ */}
      <div className="relative z-10 w-full min-h-screen">
        {/* ─── Hero Intro Section (100vh) ─── */}
        <div className="relative flex flex-col items-center justify-center h-screen px-4 text-center">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(0,0,0,0.4) 0%, transparent 65%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="z-10"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-5 leading-tight select-none">
              <span
                className="block text-green-400"
                style={{
                  textShadow:
                    "0 0 20px rgba(74,222,128,0.4), 0 0 60px rgba(74,222,128,0.15)",
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
            </h1>

            <p
              className="text-lg sm:text-xl md:text-2xl text-amber-200/90 max-w-xl mx-auto mb-3 font-medium"
              style={{ ...vt323, textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
            >
              Preserve the worlds that mattered.
            </p>

            <p
              className="text-sm sm:text-base text-amber-100/60 max-w-md mx-auto mb-12 tracking-wide font-mono"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}
            >
              Every diamond. Every death. Every world.
            </p>

            {/* Premium Minecraft-Themed Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 items-center">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98, y: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Link
                  href="/register"
                  className="inline-block px-10 py-4 font-bold text-lg text-center transition-all duration-200 select-none min-w-[200px]"
                  style={mcPrimaryButton}
                >
                  Get Started
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98, y: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Link
                  href="/login"
                  className="inline-block px-10 py-4 font-bold text-lg text-center transition-all duration-200 select-none min-w-[200px]"
                  style={mcSecondaryButton}
                >
                  Login
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll Chevron Indicator */}
          <motion.div
            className="absolute bottom-16 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-1 z-10 select-none"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            onClick={() => {
              window.scrollTo({
                top: window.innerHeight,
                behavior: "smooth",
              });
            }}
          >
            <span
              className="text-xs uppercase tracking-widest text-amber-200/50"
              style={{ ...vt323, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
            >
              Scroll to explore
            </span>
            <ChevronDown className="w-5 h-5 text-amber-200/50" />
          </motion.div>
        </div>

        {/* ─── Scrollable Content Area (Glass panels sliding up) ─── */}
        <div className="relative w-full max-w-6xl mx-auto px-4 md:px-8 py-20 space-y-32">
          {/* Section 1: Features Grid */}
          <section className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2
                className="text-3xl sm:text-4xl font-extrabold text-amber-100"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}
              >
                Features Designed for Adventurers
              </h2>
              <p
                className="text-lg text-amber-200/50 leading-relaxed"
                style={vt323}
              >
                Track, save, and share every detail of your singleplayer or multiplayer journeys.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={BookOpen}
                title="Adventure Timeline"
                description="Browse an interactive chronology of your world containing milestones, chat records, screenshots, and logs, ordered beautifully."
              />
              <FeatureCard
                icon={Activity}
                title="MLJ Companion App"
                description="Run the lightweight desktop client to automatically track your game processes, monitor session playtime, and watch screenshot folder updates."
              />
              <FeatureCard
                icon={Terminal}
                title="In-Game Logging"
                description="Write #journal in your Minecraft chat to trigger timeline notes, or type #coords base/portal/village to instantly save points of interest."
              />
              <FeatureCard
                icon={Camera}
                title="Screenshot Matcher"
                description="Automatically pairs screenshots taken within 60 seconds of a chat memory, uploading and stitching them securely to your journal entries."
              />
              <FeatureCard
                icon={Trophy}
                title="Advancement Sync"
                description="Automatically hooks into advancements (like 'Monster Hunter' or 'The End?'), syncing achievements into specific timeline items."
              />
              <FeatureCard
                icon={Share2}
                title="Public Share Links"
                description="Toggle the privacy of your worlds and easily generate public share links to show off your exploration milestones to friends."
              />
            </div>
          </section>

          {/* Section 2: Mockup and Companion Info */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span
                className="text-xs uppercase font-mono tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/25 px-3.5 py-1.5 rounded-full inline-block"
              >
                Companion Client
              </span>
              <h2
                className="text-3xl sm:text-4xl font-extrabold text-amber-100 leading-tight"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
              >
                Seamless background tracking
              </h2>
              <p className="text-amber-100/70 text-sm leading-relaxed">
                The **MLJ Companion App** runs silently in the background while you play. By reading client logs and monitoring directories, it handles all your journaling actions automatically.
              </p>
              <ul className="space-y-3.5 text-xs text-amber-200/60 font-mono">
                <li className="flex items-center gap-3.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Calculates total playtime sum per world
                </li>
                <li className="flex items-center gap-3.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Auto-detects advancements and custom hashtags
                </li>
                <li className="flex items-center gap-3.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Monitors game startup and shutdown times
                </li>
              </ul>
            </div>

            {/* Companion HUD Glass Mockup */}
            <div className="lg:col-span-7 w-full">
              <div
                className="relative p-6 rounded-xl border border-amber-700/20 bg-stone-950/75 backdrop-blur-md overflow-hidden shadow-2xl select-none"
                style={{
                  boxShadow:
                    "0 8px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,200,100,0.04)",
                }}
              >
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-amber-900/15">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold tracking-wider text-green-400">
                      COMPANION STATUS: ACTIVE
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-200/40">
                    VERSION 2.0.0
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-mono">
                  <div className="space-y-3">
                    <div>
                      <p className="text-amber-200/40 text-[10px] uppercase tracking-wider mb-0.5">
                        Connected Profile
                      </p>
                      <p className="text-amber-100 font-bold">Steve_Adventurer</p>
                    </div>
                    <div>
                      <p className="text-amber-200/40 text-[10px] uppercase tracking-wider mb-0.5">
                        Active World
                      </p>
                      <p className="text-amber-100 font-bold">New Survival Season 3</p>
                    </div>
                    <div>
                      <p className="text-amber-200/40 text-[10px] uppercase tracking-wider mb-0.5">
                        Session Timer
                      </p>
                      <p className="text-amber-400 font-bold">01h 45m 12s</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded bg-black/50 border border-amber-950/20 h-40 overflow-y-auto text-[11px] text-amber-200/60 leading-relaxed space-y-1.5">
                    <p className="text-amber-200/35">
                      [15:42:45] Game launched. Process javaw.exe active.
                    </p>
                    <p className="text-green-400/80">
                      [15:42:47] Sync: WorldActivity initialized for today.
                    </p>
                    <p className="text-amber-300/80">
                      [15:45:10] Log: advancement &apos;Monster Hunter&apos; unlocked.
                    </p>
                    <p className="text-amber-300/80">
                      [15:50:33] Log: #coords &apos;Witch Hut&apos; saved at -250, 72, 840.
                    </p>
                    <p className="text-blue-400/80">
                      [15:52:12] Screenshot watchers: paired &apos;2026-06-23_15.52.png&apos;.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: How It Works Quest Line */}
          <section className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2
                className="text-3xl sm:text-4xl font-extrabold text-amber-100"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}
              >
                Quest Log: How It Works
              </h2>
              <p
                className="text-lg text-amber-200/50 leading-relaxed"
                style={vt323}
              >
                Set up your adventure tracking pipeline in four simple milestones.
              </p>
            </div>

            <div className="max-w-2xl mx-auto relative pl-5 py-6">
              {/* Gold Quest Dashed Line */}
              <div className="absolute left-[19px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-amber-500/25" />

              <div className="space-y-10">
                <StepItem
                  stepNum="1"
                  title="Prepare Your Book"
                  description="Register on the web app and create your Minecraft world entries. Add optional configurations like MC version, mode, and seed."
                />
                <StepItem
                  stepNum="2"
                  title="Connect the Companion"
                  description="Launch the MLJ Companion App on your desktop. Paste in your secret companion API Key generated on your profile settings page."
                />
                <StepItem
                  stepNum="3"
                  title="Go Adventuring"
                  description="Launch Minecraft and play normal survival. Write `#journal` messages in chat, log `#coords`, or take screenshots to write your timeline."
                />
                <StepItem
                  stepNum="4"
                  title="Relive Your History"
                  description="Open the Minecraft Life Journal dashboard to see your stats, total playtime, mapped coordinates, advancements, and ordered memory feed."
                />
              </div>
            </div>
          </section>

          {/* Section 4: Call to Action (CTA) & Footer */}
          <section className="text-center py-12 rounded-2xl border border-amber-800/15 bg-black/45 backdrop-blur-md max-w-4xl mx-auto space-y-8 shadow-xl">
            <div className="space-y-3">
              <h2
                className="text-3xl font-extrabold text-amber-100"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
              >
                Ready to Record Your Adventure?
              </h2>
              <p className="text-sm text-amber-200/50 max-w-md mx-auto">
                Join other explorers and make sure your builds, deaths, and achievements are captured forever.
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-3.5 px-10 py-4 font-bold text-lg text-center"
                style={mcPrimaryButton}
              >
                Create Your Journal
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <div className="pt-8 border-t border-amber-900/10 text-xs text-amber-200/30 font-mono flex justify-center gap-8">
              <span>&copy; 2026 Minecraft Life Journal</span>
              <a
                href="/dashboard"
                className="hover:underline flex items-center gap-1 hover:text-amber-200/50"
              >
                Dashboard
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ─── Smaller Reusable Component Blocks ─── */
const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <motion.div
      className="relative p-6 rounded-xl border border-amber-900/20 bg-black/40 backdrop-blur-md overflow-hidden group cursor-default"
      style={{
        boxShadow: "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,100,0.03)",
      }}
      whileHover={{
        y: -4,
        borderColor: "rgba(218,165,32,0.35)",
        boxShadow:
          "0 12px 30px rgba(0,0,0,0.7), 0 0 15px rgba(218,165,32,0.08), inset 0 1px 0 rgba(255,200,100,0.05)",
      }}
      transition={{ duration: 0.25 }}
    >
      <div className="absolute -inset-px bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />

      <div className="flex items-center gap-3.5 mb-3.5 relative z-10">
        <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:text-amber-300 transition-colors duration-200">
          <Icon className="w-5 h-5" />
        </div>
        <h3
          className="text-lg font-bold text-amber-100 group-hover:text-amber-50 transition-colors duration-200"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
        >
          {title}
        </h3>
      </div>
      <p
        className="text-sm leading-relaxed text-amber-200/50 group-hover:text-amber-200/70 transition-colors duration-200 relative z-10"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
      >
        {description}
      </p>
    </motion.div>
  );
};

const StepItem = ({ stepNum, title, description }) => {
  return (
    <div className="flex gap-6 items-start relative z-10">
      <div
        className="flex items-center justify-center w-9 h-9 rounded bg-amber-600 border border-amber-400 text-white font-bold shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.2)] text-sm select-none"
        style={vt323}
      >
        {stepNum}
      </div>

      <div className="space-y-1 pt-1">
        <h4
          className="text-lg font-bold text-amber-100"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
        >
          {title}
        </h4>
        <p
          className="text-sm text-amber-200/50 leading-relaxed"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};
