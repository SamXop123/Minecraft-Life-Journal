"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const PRESET_COLORS = {
  gold: [
    "hsl(95 55% 36%)",  // grass
    "hsl(43 85% 55%)",  // gold
    "hsl(170 55% 42%)", // diamond
    "hsl(30 60% 28%)",  // dirt
  ],
  cherry: [
    "hsl(340 85% 75%)", // cherry light pink
    "hsl(330 70% 60%)", // cherry deep pink
    "hsl(320 80% 55%)", // magenta petal
    "hsl(350 90% 90%)", // white petal
  ],
  nether: [
    "hsl(0 85% 50%)",   // fiery red
    "hsl(25 90% 55%)",  // flame orange
    "hsl(45 90% 50%)",  // lava yellow
    "hsl(0 0% 30%)",    // ash charcoal
  ],
  snow: [
    "hsl(0 0% 100%)",   // pure white snow
    "hsl(200 80% 92%)", // soft blue ice
    "hsl(0 0% 90%)",    // soft gray snow
  ],
  end_shimmer: [
    "hsl(270 75% 65%)", // ender purple
    "hsl(290 85% 55%)", // void violet
    "hsl(50 90% 75%)",  // end rod sparkle
    "hsl(250 60% 70%)", // mystic indigo
  ],
};

export default function PixelParticles({ type = "gold", count = 18, motionMode = "full" }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (type === "off" || motionMode === "off") {
      setParticles([]);
      return;
    }

    const colors = PRESET_COLORS[type] || PRESET_COLORS.gold;
    const finalCount = motionMode === "reduced" ? Math.max(6, Math.floor(count / 3)) : count;

    const arr = Array.from({ length: finalCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: motionMode === "reduced" ? Math.random() * 6 + 6 : Math.random() * 4 + 3,
      delay: Math.random() * 5,
    }));
    setParticles(arr);
  }, [type, count, motionMode]);

  if (type === "off" || motionMode === "off" || particles.length === 0) {
    return null;
  }

  // Animation direction depending on type (Snow falls down, Nether/Gold floats up)
  const isFalling = type === "snow" || type === "cherry";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            imageRendering: "pixelated",
            borderRadius: type === "cherry" ? "1px" : "0px",
          }}
          animate={{
            y: isFalling ? [0, 60, 120] : [0, -60, -120],
            x: isFalling ? [0, 15, -15] : [0, -10, 10],
            opacity: [0, 0.85, 0],
            scale: [0.5, 1.2, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
