"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_COLORS = {
  achievement: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  build: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  death: "bg-red-500/10 border-red-500/30 text-red-400",
  funny: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  emotional: "bg-pink-500/10 border-pink-500/30 text-pink-400",
};

export default function TrashBinModal({
  isOpen,
  onClose,
  worldId,
  onRefreshRequired,
  fetchWithAuthRetry,
}) {
  const [deletedMemories, setDeletedMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState(null);

  /* ── Fetch soft-deleted memories ── */
  const fetchDeletedMemories = useCallback(async () => {
    if (!worldId) return;
    setLoading(true);
    try {
      const res = await fetchWithAuthRetry(`/api/memories/${worldId}?deleted=true`);
      if (res && res.ok) {
        const data = await res.json();
        setDeletedMemories(data.memories || []);
      }
    } catch (err) {
      console.error("Failed to fetch deleted memories", err);
    } finally {
      setLoading(false);
    }
  }, [worldId, fetchWithAuthRetry]);

  useEffect(() => {
    if (isOpen) {
      fetchDeletedMemories();
    }
  }, [isOpen, fetchDeletedMemories]);

  /* ── Close on ESC ── */
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  /* ── Calculate Remaining Days before TTL delete ── */
  function getDaysRemaining(deletedAtStr) {
    if (!deletedAtStr) return "10 days left";
    const deletedAt = new Date(deletedAtStr);
    const expiryDate = new Date(deletedAt.getTime() + 10 * 24 * 60 * 60 * 1000);
    const diffMs = expiryDate.getTime() - Date.now();
    const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays <= 0) return "Expiring soon";
    if (diffDays === 1) return "1 day left";
    return `${diffDays} days left`;
  }

  /* ── Restore Memory ── */
  async function handleRestore(memoryId) {
    setActioningId(memoryId);
    try {
      const res = await fetchWithAuthRetry(`/api/memories/restore/${memoryId}`, {
        method: "POST",
      });
      if (res && res.ok) {
        setDeletedMemories((prev) => prev.filter((m) => m._id !== memoryId));
        onRefreshRequired(); // Refresh active memories
      }
    } catch (err) {
      console.error("Restore memory error:", err);
    } finally {
      setActioningId(null);
    }
  }

  /* ── Permanent Delete ── */
  async function handlePermanentDelete(memoryId) {
    if (!confirm("Are you sure you want to permanently delete this memory? This action cannot be undone.")) {
      return;
    }

    setActioningId(memoryId);
    try {
      const res = await fetchWithAuthRetry(`/api/memories/delete/${memoryId}?permanent=true`, {
        method: "DELETE",
      });
      if (res && res.ok) {
        setDeletedMemories((prev) => prev.filter((m) => m._id !== memoryId));
      }
    } catch (err) {
      console.error("Permanent delete memory error:", err);
    } finally {
      setActioningId(null);
    }
  }

  /* ── Empty Trash ── */
  async function handleEmptyTrash() {
    if (deletedMemories.length === 0) return;
    if (!confirm("Are you sure you want to permanently delete all items in the Trash? This action is completely irreversible.")) {
      return;
    }

    setLoading(true);
    try {
      // Run permanent delete requests in parallel
      await Promise.all(
        deletedMemories.map((m) =>
          fetchWithAuthRetry(`/api/memories/delete/${m._id}?permanent=true`, {
            method: "DELETE",
          })
        )
      );
      setDeletedMemories([]);
    } catch (err) {
      console.error("Error emptying trash:", err);
    } finally {
      setLoading(false);
    }
  }

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
            className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh]"
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
              className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{ borderBottom: "1px solid rgba(218,165,32,0.1)" }}
            >
              <div>
                <h2
                  className="text-lg font-semibold flex items-center gap-2"
                  style={{
                    color: "rgba(255,224,176,0.95)",
                    textShadow: "0 0 15px rgba(218,165,32,0.3)",
                  }}
                >
                  🗑 Trash Bin
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,224,176,0.45)" }}>
                  Items are kept here for 10 days before automatic permanent deletion.
                </p>
              </div>
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

            {/* Actions Bar */}
            {deletedMemories.length > 0 && (
              <div
                className="px-6 py-2.5 flex items-center justify-between text-xs shrink-0"
                style={{
                  backgroundColor: "rgba(0,0,0,0.2)",
                  borderBottom: "1px solid rgba(218,165,32,0.05)",
                }}
              >
                <span style={{ color: "rgba(255,224,176,0.5)" }}>
                  {deletedMemories.length} {deletedMemories.length === 1 ? "item" : "items"} in trash
                </span>
                <button
                  onClick={handleEmptyTrash}
                  disabled={loading}
                  className="px-3 py-1 font-medium rounded border transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.15)",
                    borderColor: "rgba(239,68,68,0.3)",
                    color: "#fca5a5",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.15)";
                  }}
                >
                  Empty Trash
                </button>
              </div>
            )}

            {/* List Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar">
              {loading && deletedMemories.length === 0 ? (
                <div className="py-8 text-center text-sm" style={{ color: "rgba(255,224,176,0.5)" }}>
                  Loading trash items...
                </div>
              ) : deletedMemories.length === 0 ? (
                <div className="py-12 text-center" style={{ color: "rgba(255,224,176,0.4)" }}>
                  <p className="text-2xl mb-2">🗑</p>
                  <p className="text-sm">Trash is empty</p>
                </div>
              ) : (
                deletedMemories.map((memory) => (
                  <div
                    key={memory._id}
                    className="p-4 rounded-xl border flex gap-4 items-center justify-between"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.25)",
                      borderColor: "rgba(218,165,32,0.08)",
                    }}
                  >
                    {/* Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      {memory.imageUrl && (
                        <img
                          src={memory.imageUrl}
                          alt={memory.title}
                          className="w-12 h-12 object-cover rounded-lg shrink-0 border"
                          style={{ borderColor: "rgba(218,165,32,0.15)" }}
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h4
                            className="font-medium text-sm truncate max-w-[200px] sm:max-w-[300px]"
                            style={{ color: "rgba(255,224,176,0.9)" }}
                          >
                            {memory.title}
                          </h4>
                          <span
                            className={`inline-block px-1.5 py-0.2 border rounded text-[10px] capitalize shrink-0 ${
                              CATEGORY_COLORS[memory.category] || "bg-gray-500/10 border-gray-500/30 text-gray-400"
                            }`}
                          >
                            {memory.category}
                          </span>
                        </div>
                        <p className="text-[11px]" style={{ color: "rgba(255,224,176,0.4)" }}>
                          Deleted on {new Date(memory.deletedAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions & Expiry info */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0"
                        style={{
                          backgroundColor: "rgba(251,191,36,0.08)",
                          borderColor: "rgba(251,191,36,0.25)",
                          color: "#fbbf24",
                        }}
                      >
                        {getDaysRemaining(memory.deletedAt)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRestore(memory._id)}
                          disabled={actioningId !== null}
                          className="px-2 py-1 text-xs rounded transition-all font-medium border"
                          style={{
                            backgroundColor: "rgba(16,185,129,0.1)",
                            borderColor: "rgba(16,185,129,0.25)",
                            color: "#6ee7b7",
                          }}
                          onMouseEnter={(e) => {
                            if (actioningId === null) {
                              e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.25)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.1)";
                          }}
                        >
                          {actioningId === memory._id ? "..." : "Restore"}
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(memory._id)}
                          disabled={actioningId !== null}
                          className="px-2 py-1 text-xs rounded transition-all font-medium border"
                          style={{
                            backgroundColor: "transparent",
                            borderColor: "rgba(239,68,68,0.18)",
                            color: "rgba(239,68,68,0.6)",
                          }}
                          onMouseEnter={(e) => {
                            if (actioningId === null) {
                              e.currentTarget.style.color = "#fca5a5";
                              e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)";
                              e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "rgba(239,68,68,0.6)";
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.borderColor = "rgba(239,68,68,0.18)";
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-end px-6 py-4 shrink-0"
              style={{
                backgroundColor: "rgba(0,0,0,0.25)",
                borderTop: "1px solid rgba(218,165,32,0.08)",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-lg transition-colors border animate-none"
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
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
