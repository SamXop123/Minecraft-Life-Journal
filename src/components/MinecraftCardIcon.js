"use client";

/**
 * Authentic Pixel-Art Minecraft Collectible Card Icon (16x16)
 * Handcrafted with classic Minecraft palette:
 * - Gold/brass border with corner brackets (#fef08a, #f59e0b, #b45309)
 * - Deep leather/obsidian background (#170f09, #0d0805)
 * - Gleaming Nether Star / Diamond emblem in center (#ffffff, #7dd3fc, #38bdf8, #0284c7)
 * - Back-card deck peek (#78350f, #92400e)
 */
export default function MinecraftCardIcon({ className = "", size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: "pixelated", flexShrink: 0 }}
      aria-hidden="true"
    >
      {/* ── Back Card Peek (Shadow & Deck Effect) ── */}
      <rect x="6" y="1" width="7" height="1" fill="#78350f" />
      <rect x="13" y="1" width="1" height="1" fill="#451a03" />
      <rect x="13" y="2" width="1" height="11" fill="#78350f" />
      <rect x="14" y="2" width="1" height="11" fill="#451a03" />
      <rect x="13" y="13" width="1" height="1" fill="#451a03" />

      {/* ── Front Card Outer Rim (Gold & Bronze) ── */}
      {/* Top rim */}
      <rect x="2" y="2" width="1" height="1" fill="#fef08a" />
      <rect x="3" y="2" width="8" height="1" fill="#f59e0b" />
      <rect x="11" y="2" width="1" height="1" fill="#fef08a" />

      {/* Left rim */}
      <rect x="1" y="3" width="1" height="10" fill="#f59e0b" />

      {/* Right rim */}
      <rect x="12" y="3" width="1" height="10" fill="#b45309" />

      {/* Bottom rim */}
      <rect x="2" y="13" width="1" height="1" fill="#b45309" />
      <rect x="3" y="13" width="8" height="1" fill="#78350f" />
      <rect x="11" y="13" width="1" height="1" fill="#451a03" />

      {/* Drop shadow underneath */}
      <rect x="2" y="14" width="10" height="1" fill="#0c0704" fillOpacity="0.75" />

      {/* ── Card Body Background (Dark Obsidian / Leather) ── */}
      <rect x="2" y="3" width="10" height="10" fill="#150e09" />

      {/* Subtle Card Header Stripe */}
      <rect x="3" y="3" width="8" height="1" fill="#2d1b10" />

      {/* Holographic light glint on top-left */}
      <rect x="2" y="3" width="1" height="1" fill="#ffffff" fillOpacity="0.85" />
      <rect x="3" y="4" width="1" height="1" fill="#fef08a" fillOpacity="0.7" />

      {/* ── Center Emblem: Glowing Diamond / Star ── */}
      {/* Core bright glow */}
      <rect x="6" y="7" width="2" height="2" fill="#ffffff" />

      {/* Diamond Points (North, South, West, East) */}
      <rect x="6" y="5" width="2" height="1" fill="#67e8f9" />
      <rect x="6" y="6" width="2" height="1" fill="#38bdf8" />
      <rect x="6" y="9" width="2" height="1" fill="#0284c7" />
      <rect x="6" y="10" width="2" height="1" fill="#0369a1" />

      <rect x="4" y="7" width="1" height="2" fill="#67e8f9" />
      <rect x="5" y="7" width="1" height="2" fill="#38bdf8" />
      <rect x="8" y="7" width="1" height="2" fill="#0284c7" />
      <rect x="9" y="7" width="1" height="2" fill="#0369a1" />

      {/* Diagonal Shimmer Pixels */}
      <rect x="5" y="6" width="1" height="1" fill="#a5f3fc" />
      <rect x="8" y="6" width="1" height="1" fill="#38bdf8" />
      <rect x="5" y="9" width="1" height="1" fill="#0284c7" />
      <rect x="8" y="9" width="1" height="1" fill="#075985" />

      {/* ── Bottom Card Stats Notch / Mini XP Bar ── */}
      <rect x="4" y="11" width="6" height="1" fill="#f59e0b" fillOpacity="0.9" />
      <rect x="5" y="11" width="3" height="1" fill="#fef08a" />
      <rect x="4" y="12" width="6" height="1" fill="#78350f" />
    </svg>
  );
}

// Named alias
export { MinecraftCardIcon as MLJCardIcon };
