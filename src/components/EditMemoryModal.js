"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["achievement", "build", "death", "funny", "emotional"];

export default function EditMemoryModal({ memory, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: memory.title || "",
    category: memory.category || "achievement",
    description: memory.description || "",
    memoryDate: memory.memoryDate
      ? memory.memoryDate.split("T")[0]
      : "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(memory.imageUrl || null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

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

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.category || !form.memoryDate) {
      setError("Title, category and date are required.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      let imageUrl = memory.imageUrl ?? undefined;

      /* Upload new image if selected */
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!uploadRes.ok) {
          const up = await uploadRes.json();
          throw new Error(up.message || "Image upload failed");
        }
        const upData = await uploadRes.json();
        imageUrl = upData.imageUrl;
      }

      const body = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim() || undefined,
        memoryDate: form.memoryDate,
        imageUrl,
      };

      const res = await fetch(`/api/memories/edit/${memory._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      onSaved(data.memory);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    backgroundColor: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(218,165,32,0.18)",
    color: "rgba(255,224,176,0.92)",
    borderRadius: "0.5rem",
  };

  const focusStyle = {
    borderColor: "rgba(16,185,129,0.5)",
    boxShadow: "0 0 0 3px rgba(16,185,129,0.1)",
    outline: "none",
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{ backgroundColor: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}
      >
        {/* Card */}
        <motion.div
          className="w-full max-w-lg rounded-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            backgroundColor: "rgba(12,8,2,0.95)",
            border: "1px solid rgba(218,165,32,0.2)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,200,100,0.04), inset 0 1px 0 rgba(255,200,100,0.06)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid rgba(218,165,32,0.1)" }}
          >
            <h2
              className="text-base font-semibold"
              style={{
                color: "rgba(255,224,176,0.95)",
                textShadow: "0 0 20px rgba(218,165,32,0.3)",
              }}
            >
              Edit Memory
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md text-sm transition-all"
              style={{ color: "rgba(255,224,176,0.5)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(255,224,176,0.9)";
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,224,176,0.5)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{
                  backgroundColor: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#fca5a5",
                }}
              >
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label
                className="block text-xs mb-1.5"
                style={{ color: "rgba(255,224,176,0.55)" }}
              >
                Title *
              </label>
              <input
                name="title"
                type="text"
                required
                value={form.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm transition-all"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(218,165,32,0.18)";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="First diamond!"
              />
            </div>

            {/* Category + Date row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-xs mb-1.5"
                  style={{ color: "rgba(255,224,176,0.55)" }}
                >
                  Category *
                </label>
                <select
                  name="category"
                  required
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm capitalize transition-all"
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(218,165,32,0.18)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} style={{ backgroundColor: "#1a1008" }}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-xs mb-1.5"
                  style={{ color: "rgba(255,224,176,0.55)" }}
                >
                  Date *
                </label>
                <input
                  name="memoryDate"
                  type="date"
                  required
                  value={form.memoryDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm transition-all"
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(218,165,32,0.18)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                className="block text-xs mb-1.5"
                style={{ color: "rgba(255,224,176,0.55)" }}
              >
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm resize-none transition-all"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(218,165,32,0.18)";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="What happened?"
              />
            </div>

            {/* Image */}
            <div>
              <label
                className="block text-xs mb-1.5"
                style={{ color: "rgba(255,224,176,0.55)" }}
              >
                Screenshot {memory.imageUrl ? "(replace existing)" : "(optional)"}
              </label>

              {/* Current / preview image */}
              {imagePreview && (
                <div className="relative mb-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-36 object-cover rounded-lg"
                    style={{ border: "1px solid rgba(218,165,32,0.2)" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded text-xs"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.6)",
                      color: "#fca5a5",
                      border: "1px solid rgba(239,68,68,0.3)",
                    }}
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm cursor-pointer"
                style={{ color: "rgba(255,224,176,0.6)" }}
              />
            </div>

            {/* Footer buttons */}
            <div
              className="flex justify-end gap-2 pt-1"
              style={{ borderTop: "1px solid rgba(218,165,32,0.08)" }}
            >
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg transition-all"
                style={{
                  color: "rgba(255,224,176,0.6)",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(218,165,32,0.12)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "rgba(255,224,176,0.9)";
                  e.currentTarget.style.borderColor = "rgba(218,165,32,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,224,176,0.6)";
                  e.currentTarget.style.borderColor = "rgba(218,165,32,0.12)";
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "rgba(16,185,129,0.65)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  boxShadow: "0 2px 10px rgba(16,185,129,0.2)",
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.8)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.65)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {submitting
                  ? imageFile
                    ? "Uploading..."
                    : "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
