"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDE_DURATION = 7000; // ms

const CATEGORY_LABELS = {
  achievement: "Achievement",
  build: "Build",
  death: "Death",
  funny: "Funny",
  emotional: "Emotional",
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CinematicMode({ memories, onClose }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);
  const total = memories.length;

  /* ─── Lock body scroll ─── */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* ─── Auto-advance ─── */
  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(advance, SLIDE_DURATION);
    return () => clearInterval(intervalRef.current);
  }, [paused, advance]);

  /* ─── ESC key ─── */
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % total);
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + total) % total);
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, total]);

  const memory = memories[current];
  if (!memory) return null;

  const hasImage = !!memory.imageUrl;

  return (
    <motion.div
      className="fixed inset-0 z-9999 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Backdrop — click outside to close */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* ═══════ SLIDE CONTENT ═══════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="relative w-full h-full flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Background image with slow zoom */}
          {hasImage && (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1 }}
              animate={{ scale: 1.06 }}
              transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
            >
              <img
                src={memory.imageUrl}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* Darken image for readability */}
              <div className="absolute inset-0 bg-black/50" />
            </motion.div>
          )}

          {/* No-image gradient background */}
          {!hasImage && (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 40%, #1a1008 0%, #0a0604 60%, #000 100%)",
              }}
            />
          )}

          {/* Text overlay */}
          <div className="relative z-10 max-w-2xl w-full px-8 text-center pointer-events-none select-none">
            {/* Category */}
            <motion.p
              className="text-xs uppercase tracking-[0.25em] mb-4"
              style={{
                color: "rgba(218,165,32,0.7)",
                textShadow: "0 1px 8px rgba(0,0,0,0.8)",
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {CATEGORY_LABELS[memory.category] || memory.category}
            </motion.p>

            {/* Title */}
            <motion.h1
              className="text-3xl sm:text-5xl font-bold mb-4"
              style={{
                color: "#fff",
                textShadow:
                  "0 2px 20px rgba(0,0,0,0.8), 0 0 40px rgba(255,170,60,0.1)",
              }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              {memory.title}
            </motion.h1>

            {/* Description */}
            {memory.description && (
              <motion.p
                className="text-sm sm:text-base leading-relaxed mb-6 max-w-lg mx-auto"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  textShadow: "0 1px 10px rgba(0,0,0,0.8)",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {memory.description}
              </motion.p>
            )}

            {/* Date */}
            <motion.p
              className="text-xs"
              style={{
                color: "rgba(255,224,176,0.45)",
                textShadow: "0 1px 6px rgba(0,0,0,0.8)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.6 }}
            >
              {formatDate(memory.memoryDate)}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ═══════ CONTROLS ═══════ */}

      {/* Close button — top right */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200"
        style={{
          backgroundColor: "rgba(0,0,0,0.4)",
          color: "rgba(255,255,255,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#fff";
          e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.4)";
        }}
        aria-label="Close cinematic mode"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="3" y1="3" x2="13" y2="13" />
          <line x1="13" y1="3" x2="3" y2="13" />
        </svg>
      </button>

      {/* Pause indicator */}
      <AnimatePresence>
        {paused && (
          <motion.div
            className="absolute top-5 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full text-xs"
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              color: "rgba(255,224,176,0.6)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            Paused
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide counter + progress — bottom center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        {/* Prev */}
        <button
          onClick={() => setCurrent((c) => (c - 1 + total) % total)}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{
            backgroundColor: "rgba(0,0,0,0.35)",
            color: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
          aria-label="Previous memory"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="8,1 3,6 8,11" />
          </svg>
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {memories.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="relative w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  i === current
                    ? "rgba(218,165,32,0.8)"
                    : "rgba(255,255,255,0.2)",
                transform: i === current ? "scale(1.4)" : "scale(1)",
                boxShadow:
                  i === current
                    ? "0 0 6px rgba(218,165,32,0.5)"
                    : "none",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={() => setCurrent((c) => (c + 1) % total)}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{
            backgroundColor: "rgba(0,0,0,0.35)",
            color: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
          aria-label="Next memory"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4,1 9,6 4,11" />
          </svg>
        </button>
      </div>

      {/* Keyboard hints — bottom right */}
      <div
        className="absolute bottom-6 right-5 z-10 text-[10px] hidden sm:flex items-center gap-2"
        style={{ color: "rgba(255,255,255,0.2)" }}
      >
        <span>ESC close</span>
        <span>·</span>
        <span>← → navigate</span>
        <span>·</span>
        <span>SPACE pause</span>
      </div>
    </motion.div>
  );
}
