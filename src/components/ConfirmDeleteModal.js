"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Memory?",
  message = "Are you sure you want to delete this memory? It will be moved to the Trash Bin and permanently deleted after 10 days.",
  confirmText = "Move to Trash",
}) {
  /* ── Close on ESC ── */
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          style={{
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
          }}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              backgroundColor: "rgba(12,8,2,0.96)",
              border: "1px solid rgba(218,165,32,0.22)",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,200,100,0.06)",
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
                  color: "#fca5a5", // Danger red accent
                  textShadow: "0 0 15px rgba(239,68,68,0.25)",
                }}
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-md text-sm transition-all animate-none"
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
            <div className="px-6 py-5">
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,224,176,0.8)" }}
              >
                {message}
              </p>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-end gap-3 px-6 py-4"
              style={{
                backgroundColor: "rgba(0,0,0,0.25)",
                borderTop: "1px solid rgba(218,165,32,0.08)",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-lg transition-colors border"
                style={{
                  backgroundColor: "transparent",
                  borderColor: "rgba(218,165,32,0.18)",
                  color: "rgba(255,224,176,0.6)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "rgba(255,224,176,0.95)";
                  e.currentTarget.style.borderColor = "rgba(218,165,32,0.3)";
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,224,176,0.6)";
                  e.currentTarget.style.borderColor = "rgba(218,165,32,0.18)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-4 py-2 text-xs font-medium text-white rounded-lg transition-all"
                style={{
                  backgroundColor: "rgba(239,68,68,0.7)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  boxShadow: "0 2px 10px rgba(239,68,68,0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.85)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.7)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
