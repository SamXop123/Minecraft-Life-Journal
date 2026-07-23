"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil } from "lucide-react";

const mcGuiContainer = {
  backgroundColor: "rgba(33, 27, 22, 0.98)",
  border: "4px solid #1a1410",
  outline: "4px solid #7a6652",
  outlineOffset: "-8px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.95)",
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

const mcErrorStyle = {
  backgroundColor: "#3a0c0c",
  color: "#ff8888",
  fontFamily: "'VT323', monospace",
  fontSize: "1.15rem",
  borderTop: "3px solid #991b1b",
  borderLeft: "3px solid #991b1b",
  borderBottom: "3px solid #1a0505",
  borderRight: "3px solid #1a0505",
  padding: "10px 14px",
  borderRadius: "4px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
  letterSpacing: "0.05em",
};

export default function EditWorldModal({ isOpen, onClose, world, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    mcVersion: "",
    mode: "survival",
    type: "solo",
    seed: "",
    startedAt: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedInput, setFocusedInput] = useState("");

  useEffect(() => {
    if (world) {
      // Format date for <input type="date" />
      let formattedDate = "";
      if (world.startedAt) {
        const d = new Date(world.startedAt);
        formattedDate = d.toISOString().split("T")[0];
      }

      setForm({
        name: world.name || "",
        mcVersion: world.mcVersion || "",
        mode: world.mode || "survival",
        type: world.type || "solo",
        seed: world.seed || "",
        startedAt: formattedDate,
      });
      setError("");
    }
  }, [world, isOpen]);

  if (!isOpen || !world) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Authorization missing. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/worlds/${world._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update world.");
        setLoading(false);
        return;
      }

      if (onSaved) {
        onSaved(data.world);
      }
      onClose();
    } catch (err) {
      console.error("Failed to edit world:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          className="relative w-full max-w-xl p-6 sm:p-8"
          style={mcGuiContainer}
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-amber-900/30">
            <div className="flex items-center gap-2">
              <Pencil size={18} className="text-amber-400" />
              <h2 className="text-lg sm:text-xl font-bold uppercase" style={mcGuiTitle}>
                Edit World Details
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-stone-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-6" style={mcErrorStyle}>
              ❌ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* World Name */}
            <div className="sm:col-span-2">
              <label htmlFor="edit-name" className="block mb-1.5" style={mcGuiLabel}>
                World Name *
              </label>
              <input
                id="edit-name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                onFocus={() => setFocusedInput("name")}
                onBlur={() => setFocusedInput("")}
                className="w-full px-4 py-2.5 placeholder-stone-600 focus:outline-none"
                style={getFieldStyle("name")}
                placeholder="My World"
              />
            </div>

            {/* Version */}
            <div>
              <label htmlFor="edit-mcVersion" className="block mb-1.5" style={mcGuiLabel}>
                Version *
              </label>
              <input
                id="edit-mcVersion"
                name="mcVersion"
                type="text"
                required
                value={form.mcVersion}
                onChange={handleChange}
                onFocus={() => setFocusedInput("mcVersion")}
                onBlur={() => setFocusedInput("")}
                className="w-full px-4 py-2.5 placeholder-stone-600 focus:outline-none"
                style={getFieldStyle("mcVersion")}
                placeholder="1.20.1"
              />
            </div>

            {/* Seed */}
            <div>
              <label htmlFor="edit-seed" className="block mb-1.5" style={mcGuiLabel}>
                Seed
              </label>
              <input
                id="edit-seed"
                name="seed"
                type="text"
                value={form.seed}
                onChange={handleChange}
                onFocus={() => setFocusedInput("seed")}
                onBlur={() => setFocusedInput("")}
                className="w-full px-4 py-2.5 placeholder-stone-600 focus:outline-none"
                style={getFieldStyle("seed")}
                placeholder="Seed string"
              />
            </div>

            {/* Mode */}
            <div>
              <label htmlFor="edit-mode" className="block mb-1.5" style={mcGuiLabel}>
                Game Mode *
              </label>
              <select
                id="edit-mode"
                name="mode"
                required
                value={form.mode}
                onChange={handleChange}
                onFocus={() => setFocusedInput("mode")}
                onBlur={() => setFocusedInput("")}
                className="w-full px-4 py-2.5 focus:outline-none cursor-pointer"
                style={getFieldStyle("mode")}
              >
                <option value="survival" className="bg-stone-900 text-amber-100 font-mono">Survival</option>
                <option value="hardcore" className="bg-stone-900 text-amber-100 font-mono">Hardcore</option>
                <option value="creative" className="bg-stone-900 text-amber-100 font-mono">Creative</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label htmlFor="edit-type" className="block mb-1.5" style={mcGuiLabel}>
                World Type *
              </label>
              <select
                id="edit-type"
                name="type"
                required
                value={form.type}
                onChange={handleChange}
                onFocus={() => setFocusedInput("type")}
                onBlur={() => setFocusedInput("")}
                className="w-full px-4 py-2.5 focus:outline-none cursor-pointer"
                style={getFieldStyle("type")}
              >
                <option value="solo" className="bg-stone-900 text-amber-100 font-mono">Solo</option>
                <option value="multiplayer" className="bg-stone-900 text-amber-100 font-mono">Multiplayer</option>
              </select>
            </div>

            {/* Started Date */}
            <div className="sm:col-span-2">
              <label htmlFor="edit-startedAt" className="block mb-1.5" style={mcGuiLabel}>
                Start Date *
              </label>
              <input
                id="edit-startedAt"
                name="startedAt"
                type="date"
                required
                value={form.startedAt}
                onChange={handleChange}
                onFocus={() => setFocusedInput("startedAt")}
                onBlur={() => setFocusedInput("")}
                className="w-full px-4 py-2.5 focus:outline-none"
                style={getFieldStyle("startedAt")}
              />
            </div>

            {/* Actions */}
            <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-amber-900/30">
              <motion.button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 font-bold uppercase text-xs"
                style={{ ...mcGrayButton, fontFamily: "'Silkscreen', sans-serif" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ y: 2 }}
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 font-bold uppercase text-xs disabled:opacity-50"
                style={{ ...mcGoldButton, fontFamily: "'Silkscreen', sans-serif" }}
                whileHover={loading ? {} : { scale: 1.03 }}
                whileTap={loading ? {} : { y: 2 }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
