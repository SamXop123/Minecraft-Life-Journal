"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Star, ArrowRight, X } from "lucide-react";

/* ─── Authentic Pixel-Art Minecraft Search Icon (16x16) ─── */
export function MinecraftSearchIcon({ className = "w-5 h-5", size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: "pixelated", flexShrink: 0 }}
    >
      {/* Outer gold/brass rim */}
      <rect x="5" y="1" width="4" height="1" fill="#f59e0b" />
      <rect x="3" y="2" width="2" height="1" fill="#f59e0b" />
      <rect x="9" y="2" width="2" height="1" fill="#f59e0b" />
      <rect x="2" y="3" width="1" height="2" fill="#f59e0b" />
      <rect x="11" y="3" width="1" height="2" fill="#f59e0b" />
      <rect x="1" y="5" width="1" height="4" fill="#f59e0b" />
      <rect x="12" y="5" width="1" height="4" fill="#f59e0b" />
      <rect x="2" y="9" width="1" height="2" fill="#f59e0b" />
      <rect x="11" y="9" width="1" height="2" fill="#f59e0b" />
      <rect x="3" y="11" width="2" height="1" fill="#f59e0b" />
      <rect x="9" y="11" width="2" height="1" fill="#f59e0b" />
      <rect x="5" y="12" width="4" height="1" fill="#f59e0b" />

      {/* Inner highlight (glass reflection) */}
      <rect x="4" y="3" width="3" height="1" fill="#fef08a" />
      <rect x="3" y="4" width="2" height="2" fill="#e0f2fe" fillOpacity="0.85" />
      <rect x="4" y="5" width="2" height="1" fill="#ffffff" />

      {/* Light blue glass lens */}
      <rect x="5" y="4" width="4" height="6" fill="#38bdf8" fillOpacity="0.3" />
      <rect x="4" y="6" width="6" height="3" fill="#38bdf8" fillOpacity="0.3" />

      {/* Handle joint */}
      <rect x="10" y="10" width="2" height="2" fill="#b45309" />

      {/* Wooden handle steps going down-right */}
      <rect x="11" y="11" width="2" height="2" fill="#78350f" />
      <rect x="12" y="12" width="2" height="2" fill="#92400e" />
      <rect x="13" y="13" width="2" height="2" fill="#78350f" />
      <rect x="14" y="14" width="2" height="2" fill="#451a03" />
    </svg>
  );
}

/* ─── Authentic Pixel-Art Minecraft Red Cross Icon (16x16) ─── */
export function MinecraftCloseIcon({ className = "w-5 h-5", size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: "pixelated", flexShrink: 0 }}
    >
      <rect x="2" y="2" width="3" height="3" fill="#ef4444" />
      <rect x="11" y="2" width="3" height="3" fill="#ef4444" />
      <rect x="4" y="4" width="3" height="3" fill="#dc2626" />
      <rect x="9" y="4" width="3" height="3" fill="#dc2626" />
      <rect x="6" y="6" width="4" height="4" fill="#fca5a5" />
      <rect x="4" y="9" width="3" height="3" fill="#dc2626" />
      <rect x="9" y="9" width="3" height="3" fill="#dc2626" />
      <rect x="2" y="11" width="3" height="3" fill="#ef4444" />
      <rect x="11" y="11" width="3" height="3" fill="#ef4444" />
    </svg>
  );
}

const CATEGORY_COLORS = {
  achievement: "bg-yellow-500/15 border-yellow-500/40 text-yellow-300",
  build: "bg-blue-500/15 border-blue-500/40 text-blue-300",
  exploration: "bg-teal-500/15 border-teal-500/40 text-teal-300",
  mining: "bg-amber-500/15 border-amber-500/40 text-amber-300",
  combat: "bg-rose-500/15 border-rose-500/40 text-rose-300",
  death: "bg-red-500/15 border-red-500/40 text-red-300",
  redstone: "bg-red-600/15 border-red-600/40 text-red-300",
  story: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
  funny: "bg-pink-500/15 border-pink-500/40 text-pink-300",
  emotional: "bg-purple-500/15 border-purple-500/40 text-purple-300",
};

const CATEGORY_EMOJIS = {
  achievement: "🏆",
  build: "🏰",
  exploration: "🧭",
  mining: "⛏️",
  combat: "⚔️",
  death: "☠️",
  redstone: "⚙️",
  story: "📜",
  funny: "😂",
  emotional: "❤️",
};

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function WorldSearchOverlay({
  isOpen,
  onClose,
  memories = [],
  onSelectMemory,
  triggerOrigin = null,
}) {
  const [query, setQuery] = useState("");
  const [isHoveringCornerIcon, setIsHoveringCornerIcon] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus input when opened (delayed slightly so DOM focus doesn't interrupt flight animation)
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      setQuery("");
      inputRef.current?.focus();
    }, 420);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Calculate arc flight delta from origin to top-right corner
  const arcDeltas = useMemo(() => {
    if (typeof window === "undefined") {
      return { deltaX: -300, deltaY: 300 };
    }

    const targetX = window.innerWidth - 44; // Target center X (top-right)
    const targetY = 44; // Target center Y

    const startX = triggerOrigin?.x ?? window.innerWidth / 2;
    const startY = triggerOrigin?.y ?? window.innerHeight / 2;

    return {
      deltaX: startX - targetX,
      deltaY: startY - targetY,
    };
  }, [triggerOrigin]);

  // Instant fuzzy filtering
  const filteredMemories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return memories.filter((m) => {
      const titleMatch = m.title?.toLowerCase().includes(q);
      const descMatch = m.description?.toLowerCase().includes(q);
      const catMatch = m.category?.toLowerCase().includes(q);
      const dateStr = formatDate(m.memoryDate || m.createdAt).toLowerCase();
      const dateMatch = dateStr.includes(q);

      return titleMatch || descMatch || catMatch || dateMatch;
    });
  }, [query, memories]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── 1. Full Blurred Backdrop ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md cursor-pointer"
            style={{ willChange: "opacity" }}
            aria-label="Close search overlay"
          />

          {/* ── 2. Circular Bowl Arc Motion Icon flying into Top-Right Corner ── */}
          <motion.div
            initial={{
              x: arcDeltas.deltaX,
              y: arcDeltas.deltaY,
              rotate: 0,
              scale: 0.95,
              opacity: 1,
            }}
            animate={{
              // Deep circular bowl arc matching exact user trajectory (swoops deeply below start point, then arcs up into top-right)
              x: [
                arcDeltas.deltaX,
                arcDeltas.deltaX * 0.8,
                arcDeltas.deltaX * 0.55,
                arcDeltas.deltaX * 0.32,
                arcDeltas.deltaX * 0.12,
                0,
              ],
              y: [
                arcDeltas.deltaY,
                arcDeltas.deltaY + 100,
                arcDeltas.deltaY + 145,
                arcDeltas.deltaY * 0.68 + 55,
                arcDeltas.deltaY * 0.25,
                0,
              ],
              rotate: [0, 70, 160, 260, 360],
              scale: [1, 1.15, 1.15, 1.08, 1.02, 1],
              opacity: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.7,
              rotate: -90,
              transition: { duration: 0.15, ease: "easeIn" },
            }}
            transition={{
              duration: 0.72,
              ease: "easeInOut",
              times: [0, 0.2, 0.42, 0.65, 0.85, 1],
            }}
            style={{
              willChange: "transform",
              transform: "translate3d(0,0,0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            className="fixed top-5 right-5 sm:top-6 sm:right-6 z-[60]"
          >
            {/* Settled clean icon: looks just like a normal Minecraft button */}
            <button
              type="button"
              onClick={onClose}
              onMouseEnter={() => setIsHoveringCornerIcon(true)}
              onMouseLeave={() => setIsHoveringCornerIcon(false)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 shadow-lg backdrop-blur-md group"
              style={{
                backgroundColor: isHoveringCornerIcon
                  ? "rgba(185, 28, 28, 0.3)"
                  : "rgba(0, 0, 0, 0.4)",
                border: isHoveringCornerIcon
                  ? "1px solid rgba(239, 68, 68, 0.6)"
                  : "1px solid rgba(218, 165, 32, 0.3)",
                color: isHoveringCornerIcon ? "#fca5a5" : "#ffd896",
              }}
              title="Close search (Esc)"
              aria-label="Close search"
            >
              {isHoveringCornerIcon ? (
                <MinecraftCloseIcon size={18} />
              ) : (
                <MinecraftSearchIcon size={18} />
              )}
            </button>
          </motion.div>

          {/* ── 3. Horizontal Search Bar & Instant Results ── */}
          <div
            className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-[55] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.97 }}
              transition={{ duration: 0.28, delay: 0.08, ease: "easeOut" }}
              className="flex flex-col gap-3"
            >
              {/* Horizontal Search Input Bar */}
              <div
                className="relative rounded-xl overflow-hidden backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.85)]"
                style={{
                  backgroundColor: "rgba(18, 12, 8, 0.95)",
                  border: "2px solid rgba(245, 158, 11, 0.45)",
                  boxShadow:
                    "0 0 30px rgba(245, 158, 11, 0.12), inset 0 1px 0 rgba(255, 220, 150, 0.15)",
                }}
              >
                {/* Minecraft Search Icon on left */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <MinecraftSearchIcon size={20} />
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search memories by title, story, category, or date..."
                  className="w-full pl-12 pr-28 py-4 bg-transparent text-amber-100 placeholder-amber-200/35 outline-none transition-all"
                  style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: "1.45rem",
                    letterSpacing: "0.04em",
                  }}
                />

                {/* Right controls */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      className="p-1 rounded-md text-amber-200/50 hover:text-amber-200 hover:bg-amber-500/10 transition-colors"
                      title="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}

                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase select-none"
                    style={{
                      backgroundColor: "rgba(245, 158, 11, 0.15)",
                      color: "#ffd896",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    {query ? `${filteredMemories.length} found` : "ESC"}
                  </span>
                </div>
              </div>

              {/* ── 4. Instant Search Results List ── */}
              <AnimatePresence>
                {query.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col max-h-[60vh] sm:max-h-[65vh]"
                    style={{
                      backgroundColor: "rgba(14, 9, 6, 0.95)",
                      border: "1px solid rgba(218, 165, 32, 0.25)",
                      boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
                    }}
                  >
                    {/* Header stats */}
                    <div className="px-4 py-2.5 border-b border-amber-500/15 bg-amber-500/5 flex items-center justify-between text-xs text-amber-200/60 font-mono">
                      <span>RESULTS FOR &ldquo;{query}&rdquo;</span>
                      <span>{filteredMemories.length} MATCH{filteredMemories.length === 1 ? "" : "ES"}</span>
                    </div>

                    {/* Scrollable list */}
                    <div className="overflow-y-auto divide-y divide-amber-500/10 p-2 space-y-1">
                      {filteredMemories.length === 0 ? (
                        <div className="py-10 text-center space-y-2">
                          <p className="text-3xl">🧭</p>
                          <p
                            className="text-amber-200/80 font-bold text-sm"
                            style={{ fontFamily: "'Silkscreen', cursive" }}
                          >
                            No memories found
                          </p>
                          <p
                            className="text-amber-200/40 text-xs max-w-xs mx-auto"
                            style={{ fontFamily: "'VT323', monospace", fontSize: "1.15rem" }}
                          >
                            Try searching for &quot;diamonds&quot;, &quot;base&quot;, &quot;dragon&quot;, &quot;nether&quot;, or dates.
                          </p>
                        </div>
                      ) : (
                        filteredMemories.map((m) => {
                          const categoryStyle =
                            CATEGORY_COLORS[m.category] ||
                            "bg-amber-500/10 border-amber-500/30 text-amber-300";
                          const emoji = CATEGORY_EMOJIS[m.category] || "📜";

                          return (
                            <motion.div
                              key={m._id}
                              whileHover={{ scale: 1.01, x: 2 }}
                              onClick={() => {
                                onSelectMemory(m);
                                onClose();
                              }}
                              className="p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between gap-3 group hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {/* Thumbnail or Category Emoji */}
                                {m.imageUrl ? (
                                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-black/60 shrink-0 border border-amber-500/25">
                                    <img
                                      src={m.imageUrl}
                                      alt={m.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 rounded-md bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                                    {emoji}
                                  </div>
                                )}

                                {/* Memory Info */}
                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className="font-bold text-amber-100 group-hover:text-amber-300 transition-colors truncate text-sm"
                                      style={{
                                        fontFamily: "'Silkscreen', cursive",
                                        letterSpacing: "0.02em",
                                      }}
                                    >
                                      {m.title}
                                    </span>

                                    {m.isFavorite && (
                                      <Star
                                        size={12}
                                        className="text-amber-400 fill-amber-400 shrink-0"
                                      />
                                    )}

                                    {/* Category Pill */}
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border shrink-0 ${categoryStyle}`}
                                    >
                                      {emoji} {m.category}
                                    </span>
                                  </div>

                                  {m.description && (
                                    <p
                                      className="text-amber-200/60 text-xs line-clamp-1"
                                      style={{ fontFamily: "'VT323', monospace", fontSize: "1.1rem" }}
                                    >
                                      {m.description}
                                    </p>
                                  )}

                                  <div className="flex items-center gap-2 text-[10px] text-amber-200/40 font-mono">
                                    <Calendar size={10} />
                                    <span>{formatDate(m.memoryDate || m.createdAt)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Jump to memory arrow */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-400 shrink-0 pr-1 flex items-center gap-1 text-xs font-mono">
                                <span>Jump</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
