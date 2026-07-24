"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import PixelParticles from "@/components/PixelParticles";
import WorldCard from "@/components/WorldCard";
import { useSettings } from "@/context/SettingsContext";

/* ─── Custom Font and Premium 3D Button Styles ─── */
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
  backgroundColor: "#4a4a4a",
  color: "#ffffff",
  borderTop: "3px solid #7a7a7a",
  borderLeft: "3px solid #7a7a7a",
  borderBottom: "3px solid #2d2d2d",
  borderRight: "3px solid #2d2d2d",
  boxShadow: "0 4px 0 #1f1f1f, 0 6px 12px rgba(0,0,0,0.4)",
  textShadow: "0 2px 4px rgba(0,0,0,0.8)",
  borderRadius: "6px",
};

const mcGreenButton = {
  backgroundColor: "#1b7a43",
  color: "#ffffff",
  borderTop: "3px solid #34c759",
  borderLeft: "3px solid #34c759",
  borderBottom: "3px solid #0f4c27",
  borderRight: "3px solid #0f4c27",
  boxShadow: "0 4px 0 #0c361c, 0 6px 12px rgba(0,0,0,0.4)",
  textShadow: "0 2px 4px rgba(0,0,0,0.8)",
  borderRadius: "6px",
};

const mcGuiContainer = {
  backgroundColor: "rgba(33, 27, 22, 0.96)",
  border: "4px solid #1a1410",
  outline: "4px solid #7a6652",
  outlineOffset: "-8px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.9)",
  borderRadius: "4px",
};

const mcGuiTitle = {
  fontFamily: "'Silkscreen', sans-serif",
  color: "#ffd896",
  textShadow: "2px 2px 0px #4a360a",
  letterSpacing: "0.05em",
};

const mcGuiLabel = {
  fontFamily: "'Silkscreen', sans-serif",
  color: "#ddc3a5",
  textShadow: "1px 1px 0px #000000",
  fontSize: "0.75rem",
  letterSpacing: "0.05em",
};

const mcInputStyle = {
  backgroundColor: "#0f0c0a",
  color: "#ffffff",
  fontFamily: "'VT323', monospace",
  fontSize: "1.25rem",
  borderTop: "3px solid #2d2620",
  borderLeft: "3px solid #2d2620",
  borderBottom: "3px solid #5a4b3f",
  borderRight: "3px solid #5a4b3f",
  boxShadow: "inset 0 4px 8px rgba(0,0,0,0.95)",
  borderRadius: "4px",
  transition: "all 0.15s ease-in-out",
};

const mcErrorStyle = {
  backgroundColor: "#3a0c0c",
  color: "#ff8888",
  fontFamily: "'VT323', monospace",
  fontSize: "1.15rem",
  borderTop: "3px solid #991b1b",
  borderLeft: "3px solid #991b1b",
  borderBottom: "3px solid #1a0505",
  borderRight: "3px solid #1a0505",
  padding: "12px",
  borderRadius: "4px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
  letterSpacing: "0.05em",
};

export default function DashboardPage() {
  const router = useRouter();
  const { settings, activeTheme, effectiveParticleEffect } = useSettings();
  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");
  const [form, setForm] = useState({
    name: "",
    mcVersion: "",
    seed: "",
    mode: "survival",
    type: "solo",
    startedAt: "",
  });

  function getToken() {
    return localStorage.getItem("accessToken");
  }

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    fetchWorlds(token);
  }, [router]);

  async function fetchWorlds(token) {
    try {
      const res = await fetch("/api/worlds", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("accessToken");
        router.push("/login");
        return;
      }

      const data = await res.json();
      setWorlds(data.worlds || []);
    } catch {
      console.error("Failed to fetch worlds");
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCreateWorld(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const token = getToken();

    try {
      const res = await fetch("/api/worlds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message || "Failed to create world");
        return;
      }

      setForm({
        name: "",
        mcVersion: "",
        seed: "",
        mode: "survival",
        type: "solo",
        startedAt: "",
      });
      setShowForm(false);
      await fetchWorlds(token);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const getFieldStyle = (fieldName) => {
    const isFocused = focusedInput === fieldName;
    return {
      ...mcInputStyle,
      borderTop: isFocused ? "3px solid #ffd896" : "3px solid #2d2620",
      borderLeft: isFocused ? "3px solid #ffd896" : "3px solid #2d2620",
      borderBottom: isFocused ? "3px solid #e5a93b" : "3px solid #5a4b3f",
      borderRight: isFocused ? "3px solid #e5a93b" : "3px solid #5a4b3f",
      boxShadow: isFocused
        ? "0 0 12px rgba(255, 216, 150, 0.3), inset 0 4px 8px rgba(0, 0, 0, 0.95)"
        : "inset 0 4px 8px rgba(0, 0, 0, 0.95)",
      outline: "none",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1a1008" }}>
        <motion.p
          className="text-amber-200/60 text-lg"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Loading...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">

      {/* ═══════════════════════════════════════
          LAYER 0 — BREATHING BACKGROUND IMAGE / THEME GRADIENT
      ═══════════════════════════════════════ */}
      <motion.div
        className="fixed inset-0"
        animate={settings.motionMode === "full" ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50% 40%", zIndex: 0 }}
      >
        {activeTheme.type === "image" ? (
          <img
            src={activeTheme.image}
            alt={activeTheme.name}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            draggable={false}
          />
        ) : (
          <div
            className="absolute inset-0 w-full h-full transition-all duration-700"
            style={{ background: activeTheme.background }}
          />
        )}
      </motion.div>

      {/* ═══════════════════════════════════════
          LAYER 1 — DARK GRADIENT OVERLAY
      ═══════════════════════════════════════ */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: 1,
          background: `
            linear-gradient(
              180deg,
              rgba(8,4,1,0.7) 0%,
              rgba(12,7,2,0.45) 30%,
              rgba(10,6,2,0.4) 60%,
              rgba(8,4,1,0.75) 100%
            )
          `,
        }}
      />

      {/* ═══════════════════════════════════════
          LAYER 2 — WARM GOLDEN SUN GLOW
      ═══════════════════════════════════════ */}
      {settings.motionMode !== "off" && (
        <motion.div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 2,
            background:
              "radial-gradient(ellipse 50% 50% at 65% 20%, rgba(255,180,60,0.12) 0%, rgba(255,140,30,0.04) 40%, transparent 70%)",
          }}
          animate={settings.motionMode === "full" ? { opacity: [1, 0.8, 1] } : { opacity: 0.9 }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* ═══════════════════════════════════════
          LAYER 3 — VIGNETTE (DARK EDGES)
      ═══════════════════════════════════════ */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          background:
            "radial-gradient(ellipse 70% 65% at 50% 45%, transparent 35%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* ═══════════════════════════════════════
          LAYER 4 — PIXEL PARTICLES
      ═══════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none opacity-50" style={{ zIndex: 4 }}>
        <PixelParticles type={effectiveParticleEffect} count={18} motionMode={settings.motionMode} />
      </div>

      {/* ═══════════════════════════════════════
          CONTENT
      ═══════════════════════════════════════ */}
      <div className="relative px-4 py-10 min-h-screen" style={{ zIndex: 10 }}>
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-10 pt-6">
            <motion.h1
              className="text-2xl sm:text-3xl font-extrabold text-amber-100"
              style={{
                fontFamily: settings.pixelFonts ? "'Silkscreen', sans-serif" : "inherit",
                textShadow: "3px 3px 0px rgba(0,0,0,0.95), 0 0 30px rgba(255,170,60,0.15)",
                letterSpacing: "0.05em",
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Your Worlds
            </motion.h1>

            <motion.button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 font-bold tracking-wider uppercase text-xs transition-transform duration-100"
              style={showForm ? mcGrayButton : mcGoldButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ y: 2 }}
            >
              {showForm ? "Cancel" : "+ New World"}
            </motion.button>
          </div>

          {/* Create World Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                className="mb-10 p-8"
                style={mcGuiContainer}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2
                  className="text-lg sm:text-xl font-bold mb-6 text-center uppercase"
                  style={mcGuiTitle}
                >
                  Create New World
                </h2>

                {formError && (
                  <div className="mb-6" style={mcErrorStyle}>
                    ❌ {formError}
                  </div>
                )}

                <form
                  onSubmit={handleCreateWorld}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  <div>
                    <label
                      htmlFor="name"
                      className="block mb-2"
                      style={mcGuiLabel}
                    >
                      World Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleFormChange}
                      onFocus={() => setFocusedInput("name")}
                      onBlur={() => setFocusedInput("")}
                      className="w-full px-4 py-3 placeholder-stone-600 focus:outline-none"
                      style={getFieldStyle("name")}
                      placeholder="My Survival World"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="mcVersion"
                      className="block mb-2"
                      style={mcGuiLabel}
                    >
                      Minecraft Version *
                    </label>
                    <input
                      id="mcVersion"
                      name="mcVersion"
                      type="text"
                      required
                      value={form.mcVersion}
                      onChange={handleFormChange}
                      onFocus={() => setFocusedInput("mcVersion")}
                      onBlur={() => setFocusedInput("")}
                      className="w-full px-4 py-3 placeholder-stone-600 focus:outline-none"
                      style={getFieldStyle("mcVersion")}
                      placeholder="1.21"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="seed"
                      className="block mb-2"
                      style={mcGuiLabel}
                    >
                      Seed (optional)
                    </label>
                    <input
                      id="seed"
                      name="seed"
                      type="text"
                      value={form.seed}
                      onChange={handleFormChange}
                      onFocus={() => setFocusedInput("seed")}
                      onBlur={() => setFocusedInput("")}
                      className="w-full px-4 py-3 placeholder-stone-600 focus:outline-none"
                      style={getFieldStyle("seed")}
                      placeholder="World seed"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="mode"
                      className="block mb-2"
                      style={mcGuiLabel}
                    >
                      Game Mode *
                    </label>
                    <select
                      id="mode"
                      name="mode"
                      required
                      value={form.mode}
                      onChange={handleFormChange}
                      onFocus={() => setFocusedInput("mode")}
                      onBlur={() => setFocusedInput("")}
                      className="w-full px-4 py-3 focus:outline-none cursor-pointer"
                      style={getFieldStyle("mode")}
                    >
                      <option value="survival" className="bg-stone-900 text-amber-100 font-mono">Survival</option>
                      <option value="hardcore" className="bg-stone-900 text-amber-100 font-mono">Hardcore</option>
                      <option value="creative" className="bg-stone-900 text-amber-100 font-mono">Creative</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="type"
                      className="block mb-2"
                      style={mcGuiLabel}
                    >
                      World Type *
                    </label>
                    <select
                      id="type"
                      name="type"
                      required
                      value={form.type}
                      onChange={handleFormChange}
                      onFocus={() => setFocusedInput("type")}
                      onBlur={() => setFocusedInput("")}
                      className="w-full px-4 py-3 focus:outline-none cursor-pointer"
                      style={getFieldStyle("type")}
                    >
                      <option value="solo" className="bg-stone-900 text-amber-100 font-mono">Solo</option>
                      <option value="multiplayer" className="bg-stone-900 text-amber-100 font-mono">Multiplayer</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="startedAt"
                      className="block mb-2"
                      style={mcGuiLabel}
                    >
                      Start Date *
                    </label>
                    <input
                      id="startedAt"
                      name="startedAt"
                      type="date"
                      required
                      value={form.startedAt}
                      onChange={handleFormChange}
                      onFocus={() => setFocusedInput("startedAt")}
                      onBlur={() => setFocusedInput("")}
                      className="w-full px-4 py-3 focus:outline-none"
                      style={getFieldStyle("startedAt")}
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-col sm:flex-row gap-4 items-center justify-end mt-4">
                    <motion.button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-8 py-3.5 font-bold tracking-wider uppercase text-xs w-full sm:w-auto text-center"
                      style={{
                        ...mcGrayButton,
                        fontFamily: "'Silkscreen', sans-serif",
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ y: 2 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3.5 font-bold tracking-wider uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-center"
                      style={{
                        ...mcGreenButton,
                        fontFamily: "'Silkscreen', sans-serif",
                      }}
                      whileHover={submitting ? {} : { scale: 1.03 }}
                      whileTap={submitting ? {} : { y: 2 }}
                    >
                      {submitting ? "Creating..." : "Create World"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Worlds Grid */}
          {worlds.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-24 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <p
                className="text-amber-200/65 text-xl mb-3 font-semibold"
                style={{
                  fontFamily: "'Silkscreen', sans-serif",
                  textShadow: "0 2px 10px rgba(0,0,0,0.85)"
                }}
              >
                No worlds discovered yet
              </p>
              <p
                className="text-amber-200/40 text-sm max-w-sm leading-relaxed"
                style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: "1.2rem",
                  textShadow: "0 1px 6px rgba(0,0,0,0.6)"
                }}
              >
                Start your journey by creating a world above to journal your memories.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {worlds.map((world, i) => (
                <WorldCard
                  key={world._id}
                  world={world}
                  index={i}
                  onClick={() => router.push(`/world/${world._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
