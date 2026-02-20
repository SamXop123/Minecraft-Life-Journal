"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const COLORS = [
  "hsl(95 55% 36%)",  // grass
  "hsl(43 85% 55%)",  // gold
  "hsl(170 55% 42%)", // diamond
  "hsl(30 60% 28%)",  // dirt
];

export default function PixelParticles({ count = 20 }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const arr = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 5,
    }));
    setParticles(arr);
  }, [count]);

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
          }}
          animate={{
            y: [0, -60, -120],
            opacity: [0, 0.8, 0],
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
