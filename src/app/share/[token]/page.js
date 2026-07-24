"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/context/SettingsContext";
import PixelParticles from "@/components/PixelParticles";
import CinematicMode from "@/components/CinematicMode";
import {
  Compass,
  Swords,
  ShieldAlert,
  Hammer,
  Hourglass,
  Users,
  User,
  Calendar,
  Globe,
  Play,
  ArrowLeft,
} from "lucide-react";

const CATEGORY_STYLES = {
  achievement: { bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.25)", color: "#facc15" },
  build: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", color: "#60a5fa" },
  death: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", color: "#f87171" },
  funny: { bg: "rgba(236,72,153,0.08)", border: "rgba(236,72,153,0.25)", color: "#f472b6" },
  emotional: { bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.25)", color: "#c084fc" },
};

const mcGoldButton = {
  backgroundColor: "#e5a93b",
  color: "#ffffff",
  borderTop: "3px solid #ffd896",
  borderLeft: "3px solid #ffd896",
  borderBottom: "3px solid #8b6914",
  borderRight: "3px solid #8b6914",
  boxShadow: "0 4px 0 #4a360a, 0 6px 12px rgba(0,0,0,0.4)",
  textShadow: "0 2px 4px rgba(0,0,0,0.8)",
  borderRadius: "6px",
};

const mcPrimaryButton = {
  backgroundColor: "#1b7a43",
  color: "#ffffff",
  borderTop: "3px solid #34c759",
  borderLeft: "3px solid #34c759",
  borderBottom: "3px solid #0f4c27",
  borderRight: "3px solid #0f4c27",
  boxShadow: "0 4px 0 #0c361c, 0 8px 16px rgba(0,0,0,0.5)",
  textShadow: "0 2px 4px rgba(0,0,0,0.8)",
  borderRadius: "6px",
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPlaytime(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export default function SharedWorldPage({ params }) {
  const { settings } = useSettings();
  const [world, setWorld] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCinematic, setShowCinematic] = useState(false);

  useEffect(() => {
    async function fetchSharedWorld() {
      try {
        const { token } = await params;
        const res = await fetch(`/api/share/${token}`);

        if (res.status === 404) {
          setError("This shared world does not exist or sharing has been disabled.");
          return;
        }

        if (!res.ok) throw new Error("Failed to load");

        const data = await res.json();
        setWorld(data.world);
        setMemories(data.memories || []);
      } catch {
        setError("Something went wrong loading this world.");
      } finally {
        setLoading(false);
      }
    }

    fetchSharedWorld();
  }, [params]);

  const orderedMemories = useMemo(() => {
    if (!memories || memories.length === 0) return [];
    return [...memories].sort((a, b) => {
      const dateA = new Date(a.memoryDate || a.createdAt).getTime();
      const dateB = new Date(b.memoryDate || b.createdAt).getTime();
      if (settings?.memoryOrder === "newest") {
        return dateB - dateA;
      }
      return dateA - dateB;
    });
  }, [memories, settings?.memoryOrder]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1a1008" }}>
        <motion.p
          className="text-amber-200/60 text-lg"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Loading shared world…
        </motion.p>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "#1a1008" }}>
        <p className="text-red-400 text-lg text-center max-w-md">{error}</p>
        <a href="/" className="text-sm underline" style={{ color: "rgba(255,224,176,0.5)" }}>
          Go Home
        </a>
      </div>
    );
  }

  if (!world) return null;

  const ownerName = world.userId?.displayName || world.userId?.username || "an Adventurer";

  // Mode Info
  const mode = world.mode?.toLowerCase() || "survival";
  let ModeIcon = Swords;
  let modeColor = "#22c55e"; // green
  let modeLabel = "Survival";

  if (mode === "hardcore") {
    ModeIcon = ShieldAlert;
    modeColor = "#ef4444"; // red
    modeLabel = "Hardcore";
  } else if (mode === "creative") {
    ModeIcon = Hammer;
    modeColor = "#a855f7"; // purple
    modeLabel = "Creative";
  }

  // Type Info
  const isMulti = world.type?.toLowerCase() === "multiplayer";
  const TypeIcon = isMulti ? Users : User;
  const typeLabel = isMulti ? "Multiplayer" : "Solo";

  const vt323 = { fontFamily: "'VT323', monospace" };

  return (
    <div className="relative min-h-screen">
      {/* Fixed Background */}
      <motion.div
        className="fixed inset-0"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50% 40%", zIndex: 0 }}
      >
        <img
          src="/enhanced-mc-art.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </motion.div>

      {/* Dark overlay */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(8,4,1,0.8) 0%, rgba(12,7,2,0.55) 30%, rgba(10,6,2,0.5) 60%, rgba(8,4,1,0.85) 100%)",
        }}
      />

      {/* Warm glow */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background:
            "radial-gradient(ellipse 50% 50% at 50% 25%, rgba(255,180,60,0.08) 0%, transparent 70%)",
        }}
        animate={{ opacity: [1, 0.75, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          background:
            "radial-gradient(ellipse 70% 65% at 50% 45%, transparent 30%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Particles */}
      <div className="fixed inset-0 pointer-events-none opacity-40" style={{ zIndex: 4 }}>
        <PixelParticles count={14} />
      </div>

      {/* Content */}
      <div className="relative px-4 py-10 min-h-screen" style={{ zIndex: 10 }}>
        <div className="max-w-3xl mx-auto">

          {/* Navigation Bar */}
          <div className="flex justify-between items-center mb-6">
            <a
              href="/"
              className="flex items-center gap-1.5 text-xs text-amber-200/50 hover:text-amber-200 transition-colors bg-black/20 hover:bg-black/40 px-3.5 py-1.5 rounded-full border border-white/5 backdrop-blur-md"
            >
              <ArrowLeft size={12} />
              Main website
            </a>
          </div>

          {/* Header Sign */}
          <div className="text-center mb-8 relative">
            <span
              className="text-[10px] uppercase font-mono tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-md inline-block mb-3.5 animate-pulse"
              style={vt323}
            >
              🌍 Public Journal Shared Link
            </span>
            <p
              className="text-xs uppercase tracking-widest text-amber-200/50 mb-1"
              style={{ fontFamily: "'Silkscreen', sans-serif", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
            >
              You are viewing <span className="text-amber-300 font-bold">{ownerName}</span>'s world
            </p>
            <h1
              className="text-2xl sm:text-4xl font-extrabold text-amber-100"
              style={{
                fontFamily: "'Silkscreen', sans-serif",
                textShadow: "3px 3px 0px rgba(0,0,0,0.95), 0 0 30px rgba(255,170,60,0.15)",
                letterSpacing: "0.05em",
              }}
            >
              {world.name}
            </h1>
          </div>

          {/* Action Row - Cinematic Mode */}
          {memories.length > 0 && (
            <div className="flex justify-center mb-8">
              <motion.button
                onClick={() => setShowCinematic(true)}
                className="px-6 py-3 font-bold tracking-wider uppercase text-xs transition-transform flex items-center gap-2"
                style={mcGoldButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ y: 2 }}
              >
                <Play size={12} className="fill-current text-white" />
                Cinematic Mode
              </motion.button>
            </div>
          )}

          {/* World Details Card */}
          <motion.div
            className="backdrop-blur-lg rounded-2xl p-6 mb-8 relative overflow-hidden"
            style={{
              backgroundColor: "rgba(33, 27, 22, 0.9)",
              border: "3px solid #1a1410",
              outline: "3px solid #7a6652",
              outlineOffset: "-6px",
              boxShadow: "0 12px 30px rgba(0,0,0,0.7)",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-start justify-between mb-5 relative z-10">
              <h2
                className="text-sm font-bold text-amber-100 uppercase"
                style={{ fontFamily: "'Silkscreen', sans-serif", textShadow: "1px 1px 0px #000" }}
              >
                World Specifications
              </h2>
              {world.endedAt && (
                <span
                  className="px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/20 border-red-500/25 shadow-sm"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
                >
                  Ended
                </span>
              )}
            </div>

            {/* Grid of Capsules */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-light text-amber-100/60 mb-1 relative z-10">
              {/* Version */}
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-black/40 border border-white/5 shadow-inner">
                <Compass size={16} className="text-amber-500/60 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wider text-amber-200/30 font-semibold font-mono">Version</p>
                  <p className="font-semibold text-amber-100/95 truncate">v{world.mcVersion}</p>
                </div>
              </div>

              {/* Mode */}
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-black/40 border border-white/5 shadow-inner">
                <ModeIcon size={16} className="shrink-0" style={{ color: modeColor }} />
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wider text-amber-200/30 font-semibold font-mono">Game Mode</p>
                  <p className="font-semibold text-amber-100/95 truncate capitalize">{modeLabel}</p>
                </div>
              </div>

              {/* Type */}
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-black/40 border border-white/5 shadow-inner">
                <TypeIcon size={16} className="text-amber-500/60 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wider text-amber-200/30 font-semibold font-mono">Type</p>
                  <p className="font-semibold text-amber-100/95 truncate capitalize">{typeLabel}</p>
                </div>
              </div>

              {/* Seed */}
              {world.seed && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-black/40 border border-white/5 shadow-inner">
                  <Globe size={16} className="text-amber-500/60 shrink-0" />
                  <div className="min-w-0 w-full">
                    <p className="text-[9px] uppercase tracking-wider text-amber-200/30 font-semibold font-mono">World Seed</p>
                    <p className="font-semibold text-amber-100/95 truncate font-mono text-[10px]" title={world.seed}>{world.seed}</p>
                  </div>
                </div>
              )}

              {/* Started */}
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-black/40 border border-white/5 shadow-inner">
                <Calendar size={16} className="text-amber-500/60 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wider text-amber-200/30 font-semibold font-mono">Date Started</p>
                  <p className="font-semibold text-amber-100/95 truncate">{formatDate(world.startedAt)}</p>
                </div>
              </div>

              {/* Playtime */}
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-black/40 border border-white/5 shadow-inner">
                <Hourglass size={16} className="text-amber-500/60 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wider text-amber-200/30 font-semibold font-mono">Total Playtime</p>
                  <p className="font-semibold text-amber-100/95 truncate">{formatPlaytime(world.playtimeMinutes)}</p>
                </div>
              </div>

              {/* Ended Date (if any) */}
              {world.endedAt && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-black/40 border border-white/5 shadow-inner">
                  <Calendar size={16} className="text-amber-500/60 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-amber-200/30 font-semibold font-mono">Date Ended</p>
                    <p className="font-semibold text-amber-100/95 truncate">{formatDate(world.endedAt)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* End details */}
            {world.endedAt && (world.endReason || world.finalMessage) && (
              <div
                className="mt-5 pt-5 space-y-3 relative z-10"
                style={{ borderTop: "1px solid rgba(218,165,32,0.12)" }}
              >
                {world.endReason && (
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-wider font-semibold text-amber-200/30">End Reason</p>
                    <p className="text-sm text-amber-100/80 leading-relaxed font-light">{world.endReason}</p>
                  </div>
                )}
                {world.finalMessage && (
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-wider font-semibold text-amber-200/30">Final Message</p>
                    <p className="text-sm text-amber-100/90 italic leading-relaxed font-light">
                      &ldquo;{world.finalMessage}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Memories Timeline */}
          <motion.div
            className="backdrop-blur-lg rounded-2xl p-6 relative overflow-hidden"
            style={{
              backgroundColor: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(218,165,32,0.15)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,200,100,0.03)",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2
              className="text-lg font-bold mb-6 uppercase"
              style={{
                fontFamily: "'Silkscreen', sans-serif",
                color: "rgba(255,224,176,0.95)",
                textShadow: "0 0 15px rgba(218,165,32,0.4), 0 2px 6px rgba(0,0,0,0.7)",
              }}
            >
              Journal Memories ({memories.length})
            </h2>

            {orderedMemories.length === 0 ? (
              <p className="text-center py-12 text-sm italic" style={{ color: "rgba(255,224,176,0.3)" }}>
                No memories recorded yet in this journal.
              </p>
            ) : (
              <div className="relative border-l-2 border-amber-950/40 ml-3 pl-6 space-y-6">
                {orderedMemories.map((memory, idx) => {
                  const cat = CATEGORY_STYLES[memory.category] || CATEGORY_STYLES.achievement;

                  return (
                    <motion.div
                      key={memory._id}
                      className="relative group"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                    >
                      {/* Dot indicator */}
                      <div
                        className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded bg-amber-900 border border-amber-600/60 shadow-[0_0_8px_rgba(218,165,32,0.2)] group-hover:bg-amber-400 group-hover:border-white transition-colors"
                        style={{ transform: "rotate(45deg)" }}
                      />

                      {/* Inventory slot card */}
                      <div
                        className="p-5 rounded-xl transition-all duration-200 relative overflow-hidden"
                        style={{
                          backgroundColor: "rgba(10, 5, 2, 0.45)",
                          border: "1px solid rgba(255,255,255,0.03)",
                          boxShadow: "inset 0 1px 0 rgba(255,200,100,0.02), 0 4px 12px rgba(0,0,0,0.25)"
                        }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <h3
                              className="font-bold text-sm text-amber-100 group-hover:text-amber-50 transition-colors truncate"
                              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
                            >
                              {memory.title}
                            </h3>
                            <span
                              className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 border"
                              style={{
                                backgroundColor: cat.bg,
                                borderColor: cat.border,
                                color: cat.color,
                                textShadow: "0 1px 2px rgba(0,0,0,0.4)"
                              }}
                            >
                              {memory.category}
                            </span>
                          </div>
                          <span
                            className="text-[10px] font-mono tracking-wider shrink-0 ml-2"
                            style={{ color: "rgba(255,224,176,0.3)" }}
                          >
                            {formatDate(memory.memoryDate)}
                          </span>
                        </div>

                        {memory.description && (
                          <p
                            className="text-xs sm:text-sm mb-4 leading-relaxed font-light whitespace-pre-wrap"
                            style={{ color: "rgba(255,224,176,0.6)" }}
                          >
                            {memory.description}
                          </p>
                        )}

                        {memory.imageUrl && (
                          <div
                            className="rounded-lg overflow-hidden border border-white/5 bg-black/20 shadow-md max-w-lg"
                          >
                            <img
                              src={memory.imageUrl}
                              alt={memory.title}
                              className="w-full max-h-72 object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                              draggable={false}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* MLJ Branding Footer CTA */}
          <motion.div
            className="mt-12 text-center p-8 rounded-2xl border border-amber-800/15 bg-black/50 backdrop-blur-md max-w-2xl mx-auto space-y-6 shadow-xl relative overflow-hidden"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Subtle background glow */}
            <div className="absolute -inset-px bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 pointer-events-none rounded-2xl" />
            
            <div className="space-y-2 relative z-10">
              <h2
                className="text-base font-bold text-amber-200 uppercase"
                style={{ fontFamily: "'Silkscreen', sans-serif", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
              >
                Record Your Own Quest
              </h2>
              <p className="text-xs text-amber-100/50 max-w-md mx-auto leading-relaxed">
                You are viewing this world's timeline logs because of <span className="text-amber-300 font-semibold">Minecraft Life Journal</span>. Securely log milestones, map coordinate markers, auto-upload screenshots, and share your server adventure chronicles.
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block relative z-10"
            >
              <a
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 font-bold text-xs uppercase tracking-wider text-center"
                style={mcPrimaryButton}
              >
                Create Your Journal
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Cinematic Mode Overlay */}
      <AnimatePresence>
        {showCinematic && memories.length > 0 && (
          <CinematicMode
            memories={memories}
            onClose={() => setShowCinematic(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
