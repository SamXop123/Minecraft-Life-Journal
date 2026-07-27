"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import PixelParticles from "@/components/PixelParticles";
import {
  BookOpen,
  Terminal,
  HelpCircle,
  ShieldCheck,
  ChevronLeft,
  Download,
  Key,
  Compass,
  Camera,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function DocsPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0c0703] text-amber-100 selection:bg-amber-500/30 selection:text-amber-100">
      {/* Background image & gradient overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <img
          src="/minecraft-hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(20,12,4,0.85) 0%, rgba(8,4,1,0.98) 100%)",
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none opacity-30" style={{ zIndex: 1 }}>
        <PixelParticles count={18} />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-20 flex flex-col gap-10" style={{ zIndex: 10 }}>
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group text-amber-200/60 hover:text-amber-200 text-sm font-medium bg-black/40 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md transition-all"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="text-xs font-mono text-amber-200/50 hover:text-amber-200 px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-950/20 transition-all"
            >
              About MLJ
            </Link>
            <Link
              href="/companion"
              className="text-xs font-mono font-bold text-green-400 hover:text-green-300 px-3.5 py-1.5 rounded-lg border border-green-500/30 bg-green-950/30 transition-all flex items-center gap-1.5"
            >
              <Download size={14} />
              Download App
            </Link>
          </div>
        </div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-widest">
            <BookOpen size={14} />
            Official Manual & Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-amber-100 tracking-tight" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
            Documentation & Commands
          </h1>
          <p className="text-sm sm:text-base text-amber-200/60 leading-relaxed font-light">
            Everything you need to know about setting up MLJ Companion, logging in-game milestones, coordinate pins, and troubleshooting.
          </p>
        </motion.div>

        {/* Grid Sections */}
        <div className="space-y-12">
          {/* 1. Quick Start Guide */}
          <section className="backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/5 bg-black/40 space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-amber-200/80 flex items-center gap-2.5">
              <Sparkles size={18} className="text-amber-400" />
              Quick Start Guide
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-light leading-relaxed">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/15 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-mono text-xs border border-amber-500/30">1</span>
                  Create Account & World
                </div>
                <p className="text-amber-100/60">
                  Register on the web journal and add your Minecraft world entry with its version, mode, and seed.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/15 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono text-xs border border-purple-500/30">2</span>
                  Generate API Key
                </div>
                <p className="text-amber-100/60">
                  Visit your profile settings or companion page to generate a secure secret API Key. Copy it into the companion setup box.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/15 space-y-2">
                <div className="flex items-center gap-2 text-green-300 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-300 flex items-center justify-center font-mono text-xs border border-green-500/30">3</span>
                  Start Companion Monitoring
                </div>
                <p className="text-amber-100/60">
                  Run the MLJ Companion desktop app, select your active world, click <strong>Start Monitoring</strong>, and launch Minecraft!
                </p>
              </div>
            </div>
          </section>

          {/* 2. In-Game Chat Commands */}
          <section className="backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/5 bg-black/40 space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-amber-200/80 flex items-center gap-2.5">
              <Terminal size={18} className="text-amber-400" />
              In-Game Chat Commands
            </h2>

            <p className="text-xs text-amber-200/60 leading-relaxed font-light">
              While playing in singleplayer or multiplayer, type keywords directly into the Minecraft in-game chat bar (`T` key):
            </p>

            <div className="space-y-4">
              {/* Command 1: #journal */}
              <div className="p-5 rounded-2xl bg-stone-950/80 border border-amber-500/20 space-y-2 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-bold text-sm">#journal &lt;message&gt;</span>
                  <span className="text-[10px] text-amber-200/40 uppercase">Timeline Entry</span>
                </div>
                <p className="text-xs font-sans text-amber-100/70 font-light">
                  Logs a memory entry to your world timeline.
                </p>
                <div className="p-2.5 rounded bg-black/60 border border-white/5 text-xs text-green-300">
                  Example: <code>#journal Defeated the Ender Dragon on Day 100!</code>
                </div>
              </div>

              {/* Command 2: #coords */}
              <div className="p-5 rounded-2xl bg-stone-950/80 border border-amber-500/20 space-y-2 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-bold text-sm">#coords &lt;label&gt; &lt;X&gt; &lt;Y&gt; &lt;Z&gt;</span>
                  <span className="text-[10px] text-amber-200/40 uppercase">Pin Coordinate</span>
                </div>
                <p className="text-xs font-sans text-amber-100/70 font-light">
                  Registers a location marker pin in your world coordinate map.
                </p>
                <div className="p-2.5 rounded bg-black/60 border border-white/5 text-xs text-blue-300">
                  Example: <code>#coords Nether Fortress Portal 120 64 -450</code>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Automatic Features */}
          <section className="backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/5 bg-black/40 space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-amber-200/80 flex items-center gap-2.5">
              <Camera size={18} className="text-amber-400" />
              Automatic Log & Screenshot Pairing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-light">
              <div className="p-5 rounded-2xl bg-amber-950/15 border border-amber-500/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Camera size={16} />
                  Automatic Screenshot Pairing
                </div>
                <p className="text-amber-100/60 leading-relaxed">
                  Pressing <strong>F2</strong> in Minecraft saves a screenshot. If you type a <code>#journal</code> message within 60 seconds of taking a screenshot, the companion automatically uploads and pairs the image directly to your memory card!
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-950/15 border border-amber-500/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Clock size={16} />
                  Live Playtime Syncing
                </div>
                <p className="text-amber-100/60 leading-relaxed">
                  The companion automatically counts elapsed minutes while Minecraft is active and posts live updates every 2 minutes. Closing the companion flushes all unsynced minutes so zero playtime is ever lost.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Troubleshooting & FAQ */}
          <section className="backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/5 bg-black/40 space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-amber-200/80 flex items-center gap-2.5">
              <HelpCircle size={18} className="text-amber-400" />
              Frequently Asked Questions & Troubleshooting
            </h2>

            <div className="space-y-4 text-xs font-light leading-relaxed">
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <h4 className="font-bold text-amber-200">Q: Do I need to install Minecraft mods to use MLJ Companion?</h4>
                <p className="text-amber-100/60">
                  No! MLJ Companion reads client log output externally. It works out-of-the-box with vanilla Minecraft and modded launchers without installing any game mods or plugins.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <h4 className="font-bold text-amber-200">Q: Why did Windows display a "Windows protected your PC" message on install?</h4>
                <p className="text-amber-100/60">
                  Newly compiled desktop apps without an expensive EV Code Signing Certificate trigger generic Windows SmartScreen prompts. Simply click <strong>More Info</strong> ➔ <strong>Run Anyway</strong> to complete setup safely.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <h4 className="font-bold text-amber-200">Q: Is the Companion app safe for my PC?</h4>
                <p className="text-amber-100/60">
                  Yes, MLJ Companion is built using Rust and Tauri v2 for 0% CPU impact and minimal memory usage. It only reads log files and never alters your Minecraft game files.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Link */}
        <div className="pt-6 border-t border-white/5 text-center text-xs text-amber-200/40 font-mono">
          <span>Minecraft Life Journal v2.0.0 &bull; Documentation</span>
        </div>
      </div>
    </div>
  );
}
