"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COORD_CATEGORIES = ["base", "structure", "resource", "portal", "poi", "other"];

const COORD_CATEGORY_COLORS = {
  base: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", text: "#4ade80", emoji: "🏠", label: "Base" },
  structure: { bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)", text: "#c084fc", emoji: "🏛️", label: "Structure" },
  resource: { bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.3)", text: "#facc15", emoji: "⛏️", label: "Resource" },
  portal: { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)", text: "#a78bfa", emoji: "🌀", label: "Portal" },
  poi: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", text: "#60a5fa", emoji: "📍", label: "Point of Interest" },
  other: { bg: "rgba(156,163,175,0.12)", border: "rgba(156,163,175,0.3)", text: "#9ca3af", emoji: "📌", label: "Other" },
};

export default function EditCoordinateModal({ coordinate, onClose, onSaved, fetchWithAuthRetry }) {
  const [form, setForm] = useState({
    label: coordinate?.label || "",
    x: coordinate?.x !== undefined ? coordinate.x : "",
    y: coordinate?.y !== undefined ? coordinate.y : "",
    z: coordinate?.z !== undefined ? coordinate.z : "",
    category: coordinate?.category || "base",
    notes: coordinate?.notes || "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ── Close on ESC ── */
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.label.trim()) {
      setError("Label is required.");
      return;
    }
    if (form.x === "" || form.y === "" || form.z === "") {
      setError("X, Y, and Z coordinates are required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        label: form.label.trim(),
        x: Number(form.x),
        y: Number(form.y),
        z: Number(form.z),
        category: form.category,
        notes: form.notes.trim() || undefined,
      };

      let res;
      if (fetchWithAuthRetry) {
        res = await fetchWithAuthRetry(`/api/coordinates/edit/${coordinate._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        const token = localStorage.getItem("accessToken");
        res = await fetch(`/api/coordinates/edit/${coordinate._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res) return;

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to update coordinate.");
        return;
      }

      onSaved(data.coordinate);
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          className="relative w-full max-w-md rounded-xl p-6 border shadow-2xl z-10"
          style={{
            backgroundColor: "rgba(18, 12, 6, 0.95)",
            borderColor: "rgba(218, 165, 32, 0.25)",
            boxShadow:
              "0 0 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(218, 165, 32, 0.1)",
          }}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-lg font-bold flex items-center gap-2"
              style={{
                color: "rgba(255, 224, 176, 0.95)",
                textShadow: "0 0 10px rgba(218, 165, 32, 0.3)",
              }}
            >
              <span>📍</span> Edit Coordinate
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-lg transition-colors p-1"
            >
              ✕
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Label */}
            <div>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: "rgba(255, 224, 176, 0.75)" }}
              >
                Label / Name
              </label>
              <input
                type="text"
                name="label"
                value={form.label}
                onChange={handleChange}
                placeholder="e.g. Main Base, Iron Mine, Nether Fortress"
                className="w-full px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(218, 165, 32, 0.18)",
                  color: "rgba(255, 224, 176, 0.9)",
                }}
              />
            </div>

            {/* X, Y, Z Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label
                  className="block text-xs font-semibold mb-1"
                  style={{ color: "rgba(255, 224, 176, 0.75)" }}
                >
                  X
                </label>
                <input
                  type="number"
                  name="x"
                  step="any"
                  value={form.x}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg text-sm font-mono transition-all focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(218, 165, 32, 0.18)",
                    color: "rgba(255, 224, 176, 0.9)",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-xs font-semibold mb-1"
                  style={{ color: "rgba(255, 224, 176, 0.75)" }}
                >
                  Y
                </label>
                <input
                  type="number"
                  name="y"
                  step="any"
                  value={form.y}
                  onChange={handleChange}
                  placeholder="64"
                  className="w-full px-3 py-2 rounded-lg text-sm font-mono transition-all focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(218, 165, 32, 0.18)",
                    color: "rgba(255, 224, 176, 0.9)",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-xs font-semibold mb-1"
                  style={{ color: "rgba(255, 224, 176, 0.75)" }}
                >
                  Z
                </label>
                <input
                  type="number"
                  name="z"
                  step="any"
                  value={form.z}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg text-sm font-mono transition-all focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(218, 165, 32, 0.18)",
                    color: "rgba(255, 224, 176, 0.9)",
                  }}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: "rgba(255, 224, 176, 0.75)" }}
              >
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 capitalize"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(218, 165, 32, 0.18)",
                  color: "rgba(255, 224, 176, 0.9)",
                }}
              >
                {COORD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {COORD_CATEGORY_COLORS[cat].emoji} {COORD_CATEGORY_COLORS[cat].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: "rgba(255, 224, 176, 0.75)" }}
              >
                Notes (optional)
              </label>
              <textarea
                name="notes"
                rows={2}
                value={form.notes}
                onChange={handleChange}
                placeholder="Near the ravine, top chest has diamond picks..."
                className="w-full px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 resize-none"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(218, 165, 32, 0.18)",
                  color: "rgba(255, 224, 176, 0.9)",
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-lg transition-colors border"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  borderColor: "rgba(218, 165, 32, 0.2)",
                  color: "rgba(255, 224, 176, 0.7)",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-medium text-white rounded-lg transition-all disabled:opacity-50"
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.7)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  boxShadow: "0 2px 10px rgba(16, 185, 129, 0.2)",
                }}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
