"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Volume2, VolumeX, Sparkles, Palette, Eye, RotateCcw, Check, Sparkle } from "lucide-react";
import { useSettings, THEMES, PARTICLE_OPTIONS, MOTION_OPTIONS } from "@/context/SettingsContext";

/* ─── Minecraft GUI Button Styles ─── */
const mcGoldButton = {
  backgroundColor: "#e5a93b",
  color: "#ffffff",
  borderTop: "3px solid #ffd896",
  borderLeft: "3px solid #ffd896",
  borderBottom: "3px solid #8b6914",
  borderRight: "3px solid #8b6914",
  boxShadow: "0 4px 0 #4a360a, 0 6px 12px rgba(0,0,0,0.4)",
  textShadow: "0 2px 4px rgba(0,0,0,0.8)",
  borderRadius: "6px",
};

const mcGrayButton = {
  backgroundColor: "#3a3632",
  color: "#ddc3a5",
  borderTop: "3px solid #665b50",
  borderLeft: "3px solid #665b50",
  borderBottom: "3px solid #1a1714",
  borderRight: "3px solid #1a1714",
  boxShadow: "0 4px 0 #15120f, 0 4px 10px rgba(0,0,0,0.4)",
  textShadow: "0 1px 2px rgba(0,0,0,0.8)",
  borderRadius: "6px",
};

export default function SettingsModal() {
  const {
    settings,
    isSettingsOpen,
    closeSettings,
    updateSettings,
    resetSettings,
    effectiveParticleEffect,
  } = useSettings();

  const [activeTab, setActiveTab] = useState("appearance"); // "appearance" | "audio" | "accessibility"

  if (!isSettingsOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Dark overlay backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSettings}
        />

        {/* Modal Container */}
        <motion.div
          className="relative w-full max-w-3xl my-auto z-10 overflow-hidden"
          style={{
            backgroundColor: "rgba(26, 20, 16, 0.98)",
            border: "4px solid #120d0a",
            outline: "4px solid #7a6652",
            outlineOffset: "-8px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.95), 0 0 40px rgba(218,165,32,0.15)",
            borderRadius: "6px",
          }}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-amber-950/60 bg-black/40">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #8B6914 0%, #E5A93B 100%)",
                  border: "2px solid #FFD896",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
                }}
              >
                <Settings className="w-5 h-5 text-amber-950 stroke-[2.5]" />
              </div>
              <div>
                <h2
                  className="text-lg sm:text-xl font-bold tracking-wide"
                  style={{
                    fontFamily: settings.pixelFonts ? "'Silkscreen', sans-serif" : "inherit",
                    color: "#ffd896",
                    textShadow: "2px 2px 0px #4a360a",
                  }}
                >
                  Website Settings
                </h2>
                <p className="text-xs text-amber-200/50">Personalization, audio & accessibility</p>
              </div>
            </div>

            <button
              onClick={closeSettings}
              className="p-2 text-stone-400 hover:text-amber-200 hover:bg-stone-800/60 rounded transition-colors"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-amber-950/40 bg-stone-950/60 px-3 sm:px-4 pt-2 gap-1.5 sm:gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-semibold rounded-t-md transition-all duration-200 whitespace-nowrap ${
                activeTab === "appearance"
                  ? "bg-amber-950/50 text-amber-200 border-t-2 border-amber-400"
                  : "text-stone-400 hover:text-amber-200 hover:bg-stone-900/40"
              }`}
              style={{
                fontFamily: settings.pixelFonts ? "'Silkscreen', sans-serif" : "inherit",
              }}
            >
              <Palette className="w-4 h-4 text-amber-400" />
              Themes & Visuals
            </button>

            <button
              onClick={() => setActiveTab("audio")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-semibold rounded-t-md transition-all duration-200 whitespace-nowrap ${
                activeTab === "audio"
                  ? "bg-amber-950/50 text-amber-200 border-t-2 border-amber-400"
                  : "text-stone-400 hover:text-amber-200 hover:bg-stone-900/40"
              }`}
              style={{
                fontFamily: settings.pixelFonts ? "'Silkscreen', sans-serif" : "inherit",
              }}
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              Audio & Sound
            </button>

            <button
              onClick={() => setActiveTab("accessibility")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-semibold rounded-t-md transition-all duration-200 whitespace-nowrap ${
                activeTab === "accessibility"
                  ? "bg-amber-950/50 text-amber-200 border-t-2 border-amber-400"
                  : "text-stone-400 hover:text-amber-200 hover:bg-stone-900/40"
              }`}
              style={{
                fontFamily: settings.pixelFonts ? "'Silkscreen', sans-serif" : "inherit",
              }}
            >
              <Eye className="w-4 h-4 text-amber-400" />
              Motion & Accessibility
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">

            {/* TAB 1: APPEARANCE */}
            {activeTab === "appearance" && (
              <div className="space-y-6">

                {/* Dashboard Theme Background */}
                <div>
                  <label
                    className="block text-xs uppercase tracking-wider mb-2 font-bold"
                    style={{
                      fontFamily: settings.pixelFonts ? "'Silkscreen', sans-serif" : "inherit",
                      color: "#ffd896",
                      textShadow: "1px 1px 0px #000",
                    }}
                  >
                    Dashboard Background Theme
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {THEMES.map((theme) => {
                      const isSelected = settings.themeBackground === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => updateSettings({ themeBackground: theme.id })}
                          className={`group relative h-24 rounded-md overflow-hidden text-left p-2 border-2 transition-all duration-200 flex flex-col justify-between ${
                            isSelected
                              ? "border-amber-400 ring-2 ring-amber-400/30 scale-[1.02]"
                              : "border-stone-800 hover:border-amber-600/60 opacity-80 hover:opacity-100"
                          }`}
                          style={{
                            background: theme.type === "gradient" ? theme.background : undefined,
                          }}
                        >
                          {theme.type === "image" && (
                            <img
                              src={theme.image}
                              alt={theme.name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                          {/* Overlay for legibility */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

                          {/* Selected Check Icon */}
                          <div className="relative z-10 flex items-center justify-between w-full">
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded bg-black/60 font-semibold tracking-wider text-amber-200"
                              style={{
                                fontFamily: settings.pixelFonts ? "'Silkscreen', sans-serif" : "inherit",
                              }}
                            >
                              {theme.name}
                            </span>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold shadow">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <p className="relative z-10 text-[10px] text-stone-300 line-clamp-1">
                            {theme.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Particle Effect Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      className="block text-xs uppercase tracking-wider font-bold"
                      style={{
                        fontFamily: settings.pixelFonts ? "'Silkscreen', sans-serif" : "inherit",
                        color: "#ffd896",
                        textShadow: "1px 1px 0px #000",
                      }}
                    >
                      Ambient Particle Effects
                    </label>

                    {settings.particleEffect === "auto" && (
                      <span className="text-[10px] text-amber-300/80 bg-amber-950/60 border border-amber-600/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkle className="w-3 h-3 text-amber-400 fill-amber-400" />
                        Active: <span className="capitalize">{effectiveParticleEffect.replace("_", " ")}</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PARTICLE_OPTIONS.map((opt) => {
                      const isSelected = settings.particleEffect === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => updateSettings({ particleEffect: opt.id })}
                          className={`flex items-start gap-3 p-3 rounded-md border text-left transition-all duration-200 ${
                            isSelected
                              ? "bg-amber-950/40 border-amber-400/80 text-amber-100"
                              : "bg-stone-950/40 border-stone-800/80 text-stone-400 hover:border-stone-700 hover:text-stone-200"
                          }`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-amber-400 bg-amber-400 text-amber-950" : "border-stone-600"
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-amber-200/90">{opt.name}</div>
                            <div className="text-[11px] text-stone-400 leading-tight mt-0.5">{opt.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AUDIO & SOUND */}
            {activeTab === "audio" && (
              <div className="space-y-6">

                {/* Default Autoplay Setting */}
                <div className="p-4 rounded-lg bg-stone-950/50 border border-amber-950/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className="text-xs uppercase tracking-wider font-bold text-amber-200"
                        style={{
                          fontFamily: settings.pixelFonts ? "'Silkscreen', sans-serif" : "inherit",
                        }}
                      >
                        Default Ambient Audio
                      </h3>
                      <p className="text-xs text-stone-400 mt-1">
                        Choose whether music starts automatically when opening the site or stays closed by default.
                      </p>
                    </div>

                    <button
                      onClick={() => updateSettings({ audioAutoplay: !settings.audioAutoplay })}
                      className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.audioAutoplay ? "bg-amber-500" : "bg-stone-800"
                      }`}
                      role="switch"
                      aria-checked={settings.audioAutoplay}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-stone-900 shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center text-xs ${
                          settings.audioAutoplay ? "translate-x-6 bg-amber-200" : "translate-x-0"
                        }`}
                      >
                        {settings.audioAutoplay ? "🔊" : "🔇"}
                      </span>
                    </button>
                  </div>

                  <div className="text-[11px] text-amber-300/70 bg-amber-950/30 p-2 rounded border border-amber-900/30">
                    {settings.audioAutoplay
                      ? "✨ Music will attempt to play automatically upon opening pages."
                      : "🔇 Music remains closed/muted by default on page open until you toggle it."}
                  </div>
                </div>

                {/* Master Volume Slider */}
                <div className="p-4 rounded-lg bg-stone-950/50 border border-amber-950/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label
                      className="text-xs uppercase tracking-wider font-bold text-amber-200 flex items-center gap-2"
                      style={{
                        fontFamily: settings.pixelFonts ? "'Silkscreen', sans-serif" : "inherit",
                      }}
                    >
                      {settings.audioVolume > 0 ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
                      Master Ambient Volume
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {Math.round(settings.audioVolume * 100)}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.audioVolume}
                    onChange={(e) => updateSettings({ audioVolume: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: ACCESSIBILITY & MOTION */}
            {activeTab === "accessibility" && (
              <div className="space-y-6">

                {/* Motion Mode */}
                <div>
                  <label
                    className="block text-xs uppercase tracking-wider mb-2 font-bold"
                    style={{
                      fontFamily: settings.pixelFonts ? "'Silkscreen', sans-serif" : "inherit",
                      color: "#ffd896",
                      textShadow: "1px 1px 0px #000",
                    }}
                  >
                    Motion & Animations
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {MOTION_OPTIONS.map((m) => {
                      const isSelected = settings.motionMode === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => updateSettings({ motionMode: m.id })}
                          className={`p-3 rounded-md border text-left transition-all duration-200 flex flex-col justify-between ${
                            isSelected
                              ? "bg-amber-950/40 border-amber-400 text-amber-100"
                              : "bg-stone-950/40 border-stone-800 text-stone-400 hover:border-stone-700"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs font-bold text-amber-200">{m.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
                          </div>
                          <p className="text-[11px] text-stone-400 leading-tight">{m.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Typography Settings */}
                <div className="p-4 rounded-lg bg-stone-950/50 border border-amber-950/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className="text-xs uppercase tracking-wider font-bold text-amber-200"
                        style={{
                          fontFamily: settings.pixelFonts ? "'Silkscreen', sans-serif" : "inherit",
                        }}
                      >
                        Minecraft Pixelated Typography
                      </h3>
                      <p className="text-xs text-stone-400 mt-1">
                        Use authentic Minecraft pixel fonts (<span className="font-mono text-amber-300">Silkscreen & VT323</span>) or clean modern typography.
                      </p>
                    </div>

                    <button
                      onClick={() => updateSettings({ pixelFonts: !settings.pixelFonts })}
                      className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.pixelFonts ? "bg-amber-500" : "bg-stone-800"
                      }`}
                      role="switch"
                      aria-checked={settings.pixelFonts}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-stone-900 shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center text-xs ${
                          settings.pixelFonts ? "translate-x-6 bg-amber-200" : "translate-x-0"
                        }`}
                      >
                        {settings.pixelFonts ? "👾" : "🔤"}
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-amber-950/60 bg-black/60">
            <button
              onClick={resetSettings}
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Defaults
            </button>

            <motion.button
              onClick={closeSettings}
              className="px-6 py-2 text-xs uppercase font-bold tracking-wider"
              style={{
                ...mcGoldButton,
                fontFamily: settings.pixelFonts ? "'Silkscreen', sans-serif" : "inherit",
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ y: 2 }}
            >
              Done
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
