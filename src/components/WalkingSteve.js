"use client";

import { motion } from "framer-motion";

/**
 * WalkingSteve — Animated Minecraft Steve walking across the grass platform.
 * 
 * Place your Steve walking GIF at: public/steve-walk.gif
 * The GIF should be transparent, with Steve facing right, walking left-to-right.
 */
export default function WalkingSteve() {
  // Steve's dimensions (adjust based on your GIF)
  const steveWidth = 48; // px
  const steveHeight = 64; // px

  // Walking animation — 12 seconds to cross the screen (adjust for desired speed)
  const walkDuration = 14;

  return (
    <div
      className="absolute bottom-[28px] left-0 right-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 8, height: steveHeight }}
      aria-hidden="true"
    >
      {/* Steve container — animates from left to right */}
      <motion.div
        className="absolute"
        style={{
          width: steveWidth,
          height: steveHeight,
          bottom: 0,
        }}
        initial={{ left: -steveWidth }}
        animate={{ left: "100%" }}
        transition={{
          duration: walkDuration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Steve's shadow */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2"
          style={{
            width: steveWidth * 0.7,
            height: 6,
            background: "radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)",
            filter: "blur(2px)",
          }}
        />

        {/* Steve GIF */}
        <img
          src="/steve-walk.gif"
          alt=""
          draggable={false}
          style={{
            width: steveWidth,
            height: steveHeight,
            imageRendering: "pixelated",
            objectFit: "contain",
          }}
        />
      </motion.div>
    </div>
  );
}
