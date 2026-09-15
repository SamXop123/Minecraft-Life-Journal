"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

// 8 radial spark particle angles
const PARTICLES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i * 45 * Math.PI) / 180;
  return {
    id: i,
    x: Math.cos(angle) * 16,
    y: Math.sin(angle) * 16,
  };
});

export default function FavoriteStarButton({
  isFavorite,
  onToggle,
  disabled = false,
  className = "",
  size = "md", // "sm" | "md" | "lg"
}) {
  const [isSparkling, setIsSparkling] = useState(false);

  const starSize = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4";
  const buttonPadding = size === "sm" ? "p-1" : "p-1.5";

  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled) return;

    if (!isFavorite) {
      // Trigger gold spark burst
      setIsSparkling(true);
      setTimeout(() => setIsSparkling(false), 600);
    }
    onToggle && onToggle();
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Radiating Gold Particle Burst when favorited */}
      <AnimatePresence>
        {isSparkling && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {PARTICLES.map((p) => (
              <motion.span
                key={p.id}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  scale: [0, 1.4, 0],
                  opacity: [1, 0.9, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#f59e0b]"
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        whileTap={{ scale: 0.65, rotate: -20 }}
        whileHover={{ scale: 1.15 }}
        title={isFavorite ? "Remove from Favorites Wall" : "Add to Favorites Wall"}
        className={`relative z-10 rounded-full transition-colors flex items-center justify-center ${buttonPadding} ${
          isFavorite
            ? "bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30"
            : "hover:bg-amber-400/10 border border-transparent hover:border-amber-400/20"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <motion.div
          animate={
            isFavorite
              ? {
                  scale: [1, 1.35, 0.9, 1.12, 1],
                  rotate: [0, -18, 18, -6, 0],
                }
              : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.45, ease: [0.175, 0.885, 0.32, 1.275] }}
        >
          <Star
            className={`${starSize} transition-all duration-200 ${
              isFavorite
                ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]"
                : "text-amber-200/40 hover:text-amber-300"
            }`}
          />
        </motion.div>
      </motion.button>
    </div>
  );
}
