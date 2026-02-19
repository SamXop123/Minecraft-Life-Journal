"use client";

import { motion } from "framer-motion";

/**
 * WorldCard — a single world entry with golden border glow,
 * semi-transparent dark overlay, hover lift + shadow.
 * Warm-toned typography with text-shadow.
 */
export default function WorldCard({ world, index, onClick }) {
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <motion.div
      onClick={onClick}
      className="relative bg-black/40 backdrop-blur-lg border border-amber-700/25 rounded-xl p-5 cursor-pointer transition-colors duration-200 hover:border-amber-500/50 hover:bg-black/50 group"
      style={{
        boxShadow:
          "0 2px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,100,0.04)",
      }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      whileHover={{
        y: -5,
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(218,165,32,0.1), inset 0 1px 0 rgba(255,200,100,0.08)",
      }}
    >
      {/* Subtle golden top-edge highlight */}
      <div
        className="absolute top-0 left-4 right-4 h-px rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(218,165,32,0.3), transparent)",
        }}
      />

      <h2
        className="text-lg font-semibold text-amber-50 mb-3 truncate"
        style={{ textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}
      >
        {world.name}
      </h2>

      <div className="space-y-1.5 text-sm">
        <p>
          <span
            className="text-amber-700/80"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
          >
            Version:
          </span>{" "}
          <span
            className="text-amber-100/70"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
          >
            {world.mcVersion}
          </span>
        </p>
        <p>
          <span
            className="text-amber-700/80"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
          >
            Mode:
          </span>{" "}
          <span
            className="text-amber-100/70 capitalize"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
          >
            {world.mode}
          </span>
        </p>
        <p>
          <span
            className="text-amber-700/80"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
          >
            Started:
          </span>{" "}
          <span
            className="text-amber-100/70"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
          >
            {formatDate(world.startedAt)}
          </span>
        </p>
      </div>

      {world.endedAt && (
        <span
          className="inline-block mt-3 px-2.5 py-0.5 bg-red-900/30 border border-red-500/30 rounded text-xs text-red-400"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
        >
          Ended
        </span>
      )}

      {/* Hover glow flare at bottom */}
      <div
        className="absolute bottom-0 left-6 right-6 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(218,165,32,0.2), transparent)",
        }}
      />
    </motion.div>
  );
}
