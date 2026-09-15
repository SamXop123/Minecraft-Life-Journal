"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Calendar, Sparkles } from "lucide-react";
import FavoriteStarButton from "./FavoriteStarButton";

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

const CATEGORY_COLORS = {
  achievement: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  build: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  exploration: "bg-teal-500/10 border-teal-500/30 text-teal-400",
  mining: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  combat: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  death: "bg-red-500/10 border-red-500/30 text-red-400",
  redstone: "bg-red-600/10 border-red-600/30 text-red-400",
  story: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  funny: "bg-pink-500/10 border-pink-500/30 text-pink-400",
  emotional: "bg-purple-500/10 border-purple-500/30 text-purple-400",
};

export default function FavoritesWallDrawer({
  isOpen,
  onClose,
  favorites = [],
  onToggleFavorite,
  isOwner = false,
  onScreenshotClick,
}) {
  // ESC listener & lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[990] flex justify-end">
          {/* Dimmed & Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Sliding Sidebar Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full sm:w-[480px] md:w-[520px] h-full flex flex-col border-l shadow-2xl overflow-hidden"
            style={{
              backgroundColor: "rgba(20, 13, 7, 0.97)",
              borderColor: "rgba(218, 165, 32, 0.25)",
              boxShadow: "-8px 0 35px rgba(0, 0, 0, 0.8), 0 0 20px rgba(218, 165, 32, 0.08)",
            }}
          >
            {/* Top Bar Header */}
            <div
              className="p-4 sm:p-5 border-b flex items-center justify-between shrink-0"
              style={{
                backgroundColor: "rgba(14, 9, 5, 0.9)",
                borderColor: "rgba(218, 165, 32, 0.18)",
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2
                      className="text-base sm:text-lg font-bold truncate text-amber-100 uppercase tracking-wide"
                      style={{
                        fontFamily: "'Silkscreen', sans-serif",
                        textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                      }}
                    >
                      Favorites Wall
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                      {favorites.length}
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/50 truncate">
                    Curated Hall of Fame & Best Moments
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-amber-200/60 hover:text-amber-100 hover:bg-white/5 transition-colors border border-transparent hover:border-amber-500/20"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body / Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {favorites.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Star className="w-8 h-8 text-amber-400/40" />
                  </div>
                  <div className="space-y-1.5 max-w-xs">
                    <h3 className="text-sm font-semibold text-amber-200">
                      No Favorites Added Yet
                    </h3>
                    <p className="text-xs text-amber-200/50 leading-relaxed">
                      {isOwner
                        ? "Click the ⭐ star icon on any memory card to pin your greatest moments to this Favorites Wall."
                        : "The world owner has not pinned any highlights to the Favorites Wall yet."}
                    </p>
                  </div>
                  {isOwner && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/80">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Tip: Star boss fights, mega builds, & lore
                    </div>
                  )}
                </div>
              ) : (
                favorites.map((memory) => {
                  const badgeColor =
                    CATEGORY_COLORS[memory.category] ||
                    "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                  const emoji = CATEGORY_EMOJIS[memory.category] || "🏷️";

                  return (
                    <motion.div
                      key={memory._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-xl border p-3.5 sm:p-4 relative transition-all duration-200 hover:border-amber-500/40"
                      style={{
                        backgroundColor: "rgba(30, 19, 10, 0.65)",
                        borderColor: "rgba(218, 165, 32, 0.22)",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
                      }}
                    >
                      {/* Top row: Title, Category badge, Star unpin button */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <h4
                            className="text-sm font-bold text-amber-100 truncate"
                            title={memory.title}
                          >
                            {memory.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium border rounded capitalize ${badgeColor}`}
                            >
                              <span>{emoji}</span>
                              <span>{memory.category}</span>
                            </span>
                            {memory.memoryDate && (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-mono"
                                style={{ color: "rgba(255, 224, 176, 0.45)" }}
                              >
                                <Calendar className="w-3 h-3 text-amber-400/50" />
                                {new Date(memory.memoryDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Owner can toggle star */}
                        {isOwner && onToggleFavorite && (
                          <FavoriteStarButton
                            isFavorite={true}
                            onToggle={() => onToggleFavorite(memory)}
                            size="sm"
                          />
                        )}
                      </div>

                      {/* Description if present */}
                      {memory.description && (
                        <p
                          className="text-xs mb-3 leading-relaxed font-light line-clamp-3"
                          style={{ color: "rgba(255, 224, 176, 0.7)" }}
                        >
                          {memory.description}
                        </p>
                      )}

                      {/* Screenshot Thumbnail (Clickable to Zoom) */}
                      {memory.imageUrl && (
                        <div
                          onClick={() => onScreenshotClick && onScreenshotClick(memory)}
                          className="rounded-lg overflow-hidden border border-amber-500/20 bg-black/40 cursor-pointer hover:opacity-95 transition-opacity"
                        >
                          <img
                            src={memory.imageUrl}
                            alt={memory.title}
                            className="w-full max-h-48 object-cover select-none"
                            draggable={false}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Bottom Footer Stats */}
            {favorites.length > 0 && (
              <div
                className="p-3 border-t text-center shrink-0 text-[11px] font-mono tracking-wider"
                style={{
                  backgroundColor: "rgba(14, 9, 5, 0.9)",
                  borderColor: "rgba(218, 165, 32, 0.15)",
                  color: "rgba(255, 224, 176, 0.5)",
                }}
              >
                {favorites.length} world {favorites.length === 1 ? "highlight" : "highlights"} selected
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
