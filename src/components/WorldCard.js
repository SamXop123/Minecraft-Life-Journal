"use client";

import { motion } from "framer-motion";
import {
  Swords,
  ShieldAlert,
  Hammer,
  Hourglass,
  Users,
  User,
  Calendar,
  Globe,
  Compass,
  Pencil,
} from "lucide-react";

/**
 * WorldCard — a redesigned premium Minecraft-themed world card
 * styled to look like an inventory/advancement slot with game-mode icons,
 * stats capsules, and a gold playtime badge.
 */
export default function WorldCard({ world, index, onClick, onEdit }) {
  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatPlaytime(totalMinutes) {
    if (!totalMinutes || totalMinutes <= 0) return "0m";
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  // Get Mode Info
  const mode = world.mode?.toLowerCase() || "survival";
  let ModeIcon = Swords;
  let modeColor = "#22c55e"; // green
  let modeBg = "rgba(34,197,94,0.1)";
  let modeBorder = "rgba(34,197,94,0.25)";
  let modeLabel = "Survival";

  if (mode === "hardcore") {
    ModeIcon = ShieldAlert;
    modeColor = "#ef4444"; // red
    modeBg = "rgba(239,68,68,0.1)";
    modeBorder = "rgba(239,68,68,0.25)";
    modeLabel = "Hardcore";
  } else if (mode === "creative") {
    ModeIcon = Hammer;
    modeColor = "#a855f7"; // purple
    modeBg = "rgba(168,85,247,0.1)";
    modeBorder = "rgba(168,85,247,0.25)";
    modeLabel = "Creative";
  }

  // Get Type Info
  const isMulti = world.type?.toLowerCase() === "multiplayer";
  const TypeIcon = isMulti ? Users : User;
  const typeLabel = isMulti ? "Multiplayer" : "Solo";

  const vt323 = { fontFamily: "'VT323', monospace" };

  return (
    <motion.div
      onClick={onClick}
      className="relative bg-black/45 backdrop-blur-md border border-amber-800/15 rounded-2xl p-5 cursor-pointer transition-colors duration-200 hover:border-amber-500/40 group overflow-hidden"
      style={{
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,200,100,0.03)",
      }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      whileHover={{
        y: -4,
        boxShadow:
          "0 15px 40px rgba(0,0,0,0.8), 0 0 18px rgba(218,165,32,0.08), inset 0 1px 0 rgba(255,200,100,0.06)",
      }}
    >
      {/* Decorative inner gradient on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2 min-w-0">
          <h2
            className="text-lg font-bold text-amber-100 group-hover:text-amber-50 transition-colors truncate"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
          >
            {world.name}
          </h2>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(world);
              }}
              title="Edit World Details"
              aria-label="Edit World Details"
              className="p-1 rounded bg-black/40 hover:bg-amber-500/20 text-amber-200/50 hover:text-amber-200 border border-white/10 hover:border-amber-500/40 transition-all duration-150 shrink-0 opacity-80 group-hover:opacity-100"
            >
              <Pencil size={13} />
            </button>
          )}
        </div>
        {/* Game Mode Badge */}
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider shrink-0"
          style={{
            backgroundColor: modeBg,
            borderColor: modeBorder,
            color: modeColor,
            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}
        >
          <ModeIcon size={12} />
          <span>{modeLabel}</span>
        </div>
      </div>

      {/* Stats Capsules Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-light text-amber-100/60 mb-5 relative z-10">
        {/* Version Capsule */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-black/35 border border-white/5">
          <Compass size={14} className="text-amber-500/60 shrink-0" />
          <span className="truncate">v{world.mcVersion}</span>
        </div>

        {/* Type Capsule */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-black/35 border border-white/5">
          <TypeIcon size={14} className="text-amber-500/60 shrink-0" />
          <span className="truncate capitalize">{typeLabel}</span>
        </div>

        {/* Started Date Capsule (Spans 2 columns) */}
        <div className="col-span-2 flex items-center gap-2 p-2 rounded-lg bg-black/35 border border-white/5">
          <Calendar size={14} className="text-amber-500/60 shrink-0" />
          <span className="truncate">Started {formatDate(world.startedAt)}</span>
        </div>
      </div>

      {/* Footer Badges & Playtime */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5 relative z-10">
        {/* Playtime Badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold"
          style={{
            boxShadow: "inset 0 1px 0 rgba(255,200,100,0.03)",
          }}
        >
          <Hourglass size={13} className="text-amber-400" />
          <span style={vt323} className="text-sm tracking-wider">
            {formatPlaytime(world.playtimeMinutes)}
          </span>
        </div>

        {/* Status Badges (Public / Ended) */}
        <div className="flex gap-1.5 items-center">
          {world.isPublic && (
            <div
              className="p-1.5 rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/25 flex items-center justify-center"
              title="Publicly Shared World"
            >
              <Globe size={13} />
            </div>
          )}

          {world.endedAt && (
            <span
              className="px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider text-red-400 bg-red-950/20 border-red-500/25"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
            >
              Ended
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
