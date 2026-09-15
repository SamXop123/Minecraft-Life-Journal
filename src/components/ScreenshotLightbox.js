"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

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

export default function ScreenshotLightbox({ activeItem, items = [], onClose, onNavigate }) {
  // If items array is provided, track current index
  const currentIndex = items.findIndex((it) => it._id === activeItem?._id || it.imageUrl === activeItem?.imageUrl);
  const hasPrev = items.length > 1 && currentIndex > 0;
  const hasNext = items.length > 1 && currentIndex >= 0 && currentIndex < items.length - 1;

  // Lock body scroll while lightbox is open
  useEffect(() => {
    if (!activeItem) return;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [activeItem]);

  // Keyboard navigation & ESC handler
  useEffect(() => {
    if (!activeItem) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && hasPrev && onNavigate) {
        onNavigate(items[currentIndex - 1]);
      } else if (e.key === "ArrowRight" && hasNext && onNavigate) {
        onNavigate(items[currentIndex + 1]);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeItem, currentIndex, hasPrev, hasNext, items, onClose, onNavigate]);

  if (!activeItem) return null;

  const emoji = CATEGORY_EMOJIS[activeItem.category] || "🏷️";
  const badgeColor =
    CATEGORY_COLORS[activeItem.category] ||
    "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 select-none">
        {/* Blurred & Dimmed Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        />

        {/* Lightbox Container */}
        <motion.div
          className="relative z-10 flex flex-col items-center max-w-[95vw] max-h-[96vh] w-full"
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar Header */}
          <div
            className="w-full max-w-4xl flex items-center justify-between mb-3 px-4 py-2.5 rounded-xl border"
            style={{
              backgroundColor: "rgba(18, 12, 6, 0.9)",
              borderColor: "rgba(218, 165, 32, 0.22)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6)",
            }}
          >
            {/* Title & Category Badge */}
            <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
              <h3
                className="font-medium text-sm sm:text-base truncate"
                style={{
                  color: "rgba(255, 224, 176, 0.95)",
                  textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                }}
              >
                {activeItem.title || "Screenshot"}
              </h3>
              {activeItem.category && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded text-xs capitalize ${badgeColor}`}
                >
                  <span>{emoji}</span>
                  <span>{activeItem.category}</span>
                </span>
              )}
              {activeItem.memoryDate && (
                <span
                  className="hidden sm:inline-flex items-center gap-1 text-xs"
                  style={{ color: "rgba(255, 224, 176, 0.55)" }}
                >
                  <Calendar className="w-3 h-3 text-amber-400/60" />
                  {new Date(activeItem.memoryDate).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Actions: Close */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                style={{
                  color: "rgba(255, 224, 176, 0.8)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(218, 165, 32, 0.15)",
                }}
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Zoomed Image & Navigation Area */}
          <div className="relative flex items-center justify-center max-w-full">
            {/* Previous Arrow */}
            {hasPrev && onNavigate && (
              <button
                onClick={() => onNavigate(items[currentIndex - 1])}
                className="absolute left-2 sm:left-4 z-20 p-2 sm:p-3 rounded-full text-white bg-black/60 hover:bg-black/85 border border-white/10 transition-all hover:scale-105"
                style={{
                  color: "rgba(255, 224, 176, 0.9)",
                  borderColor: "rgba(218, 165, 32, 0.25)",
                }}
                title="Previous screenshot (Left Arrow)"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* The Zoomed Screenshot */}
            <motion.div
              key={activeItem.imageUrl}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl overflow-hidden border shadow-2xl"
              style={{
                borderColor: "rgba(218, 165, 32, 0.28)",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                boxShadow: "0 0 50px rgba(0, 0, 0, 0.9), 0 0 20px rgba(218, 165, 32, 0.12)",
              }}
            >
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title || "Minecraft Screenshot"}
                className="max-w-[92vw] max-h-[75vh] md:max-h-[78vh] object-contain block select-none pointer-events-auto"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </motion.div>

            {/* Next Arrow */}
            {hasNext && onNavigate && (
              <button
                onClick={() => onNavigate(items[currentIndex + 1])}
                className="absolute right-2 sm:right-4 z-20 p-2 sm:p-3 rounded-full text-white bg-black/60 hover:bg-black/85 border border-white/10 transition-all hover:scale-105"
                style={{
                  color: "rgba(255, 224, 176, 0.9)",
                  borderColor: "rgba(218, 165, 32, 0.25)",
                }}
                title="Next screenshot (Right Arrow)"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>

          {/* Bottom Caption / Description */}
          {activeItem.description && (
            <div
              className="mt-3 px-4 py-2 rounded-xl text-center max-w-2xl text-xs sm:text-sm border"
              style={{
                backgroundColor: "rgba(18, 12, 6, 0.85)",
                borderColor: "rgba(218, 165, 32, 0.15)",
                color: "rgba(255, 224, 176, 0.85)",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.5)",
              }}
            >
              {activeItem.description}
            </div>
          )}

          {/* Screenshot Gallery Counter (e.g. 3 of 12) */}
          {items.length > 1 && currentIndex >= 0 && (
            <p
              className="mt-2 text-[11px] font-mono tracking-wider"
              style={{ color: "rgba(255, 224, 176, 0.5)" }}
            >
              {currentIndex + 1} of {items.length} screenshots
            </p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
