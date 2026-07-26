"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/context/SettingsContext";
import CinematicMode from "@/components/CinematicMode";
import PixelParticles from "@/components/PixelParticles";
import EditMemoryModal from "@/components/EditMemoryModal";
import EditWorldModal from "@/components/EditWorldModal";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import TrashBinModal from "@/components/TrashBinModal";
import { compressImage } from "@/lib/utils/compressImage";
import { Pencil } from "lucide-react";

const CATEGORIES = ["achievement", "build", "death", "funny", "emotional"];

const CATEGORY_COLORS = {
  achievement: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  build: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  death: "bg-red-500/10 border-red-500/30 text-red-400",
  funny: "bg-pink-500/10 border-pink-500/30 text-pink-400",
  emotional: "bg-purple-500/10 border-purple-500/30 text-purple-400",
};

const COORD_CATEGORIES = ["base", "structure", "resource", "portal", "poi", "other"];

const COORD_CATEGORY_COLORS = {
  base: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", text: "#4ade80", emoji: "🏠" },
  structure: { bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)", text: "#c084fc", emoji: "🏛️" },
  resource: { bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.3)", text: "#facc15", emoji: "⛏️" },
  portal: { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)", text: "#a78bfa", emoji: "🌀" },
  poi: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", text: "#60a5fa", emoji: "📍" },
  other: { bg: "rgba(156,163,175,0.12)", border: "rgba(156,163,175,0.3)", text: "#9ca3af", emoji: "📌" },
};

export default function WorldDetailPage({ params }) {
  const router = useRouter();
  const { settings } = useSettings();
  const [world, setWorld] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditWorldOpen, setIsEditWorldOpen] = useState(false);
  const [showMemoryForm, setShowMemoryForm] = useState(false);
  const [memoryForm, setMemoryForm] = useState({
    title: "",
    category: "achievement",
    description: "",
    memoryDate: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [memoryFormError, setMemoryFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [worldId, setWorldId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showCinematic, setShowCinematic] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // Coordinate Tracker state
  const coordFormRef = useRef(null);
  const [coordinates, setCoordinates] = useState([]);
  const [showCoordForm, setShowCoordForm] = useState(false);
  const [coordForm, setCoordForm] = useState({
    label: "",
    x: "",
    y: "",
    z: "",
    category: "base",
    notes: "",
  });
  const [coordFormError, setCoordFormError] = useState("");
  const [coordSubmitting, setCoordSubmitting] = useState(false);
  const [coordDeletingId, setCoordDeletingId] = useState(null);
  const [copiedCoordId, setCopiedCoordId] = useState(null);

  const orderedMemories = useMemo(() => {
    if (!memories || memories.length === 0) return [];
    return [...memories].sort((a, b) => {
      const dateA = new Date(a.memoryDate || a.createdAt).getTime();
      const dateB = new Date(b.memoryDate || b.createdAt).getTime();
      const createdA = new Date(a.createdAt || a.memoryDate).getTime();
      const createdB = new Date(b.createdAt || b.memoryDate).getTime();

      if (settings?.memoryOrder === "newest") {
        if (dateB !== dateA) return dateB - dateA;
        return createdB - createdA;
      }
      if (dateA !== dateB) return dateA - dateB;
      return createdA - createdB;
    });
  }, [memories, settings?.memoryOrder]);

  function getToken() {
    return localStorage.getItem("accessToken");
  }

  const refreshAccessToken = useCallback(async () => {
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
    });

    if (!refreshRes.ok) {
      localStorage.removeItem("accessToken");
      router.push("/login");
      return null;
    }

    const refreshData = await refreshRes.json();
    localStorage.setItem("accessToken", refreshData.accessToken);
    return refreshData.accessToken;
  }, [router]);

  const fetchWithAuthRetry = useCallback(
    async (url, options = {}) => {
      let token = getToken();

      if (!token) {
        router.push("/login");
        return null;
      }

      const request = async (accessToken) =>
        fetch(url, {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${accessToken}`,
          },
        });

      let res = await request(token);

      if (res.status === 401) {
        token = await refreshAccessToken();

        if (!token) {
          return null;
        }

        res = await request(token);
      }

      return res;
    },
    [refreshAccessToken, router]
  );

  const fetchMemories = useCallback(
    async (id) => {
      try {
        const res = await fetchWithAuthRetry(`/api/memories/${id}`);

        if (!res) {
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setMemories(data.memories || []);
        }
      } catch {
        console.error("Failed to fetch memories");
      }
    },
    [fetchWithAuthRetry]
  );

  const fetchCoordinates = useCallback(
    async (id) => {
      try {
        const res = await fetchWithAuthRetry(`/api/coordinates/${id}`);
        if (!res) return;
        if (res.ok) {
          const data = await res.json();
          setCoordinates(data.coordinates || []);
        }
      } catch {
        console.error("Failed to fetch coordinates");
      }
    },
    [fetchWithAuthRetry]
  );

  async function handleAddCoordinate(e) {
    e.preventDefault();
    setCoordFormError("");
    setCoordSubmitting(true);

    try {
      const res = await fetchWithAuthRetry("/api/coordinates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...coordForm, worldId }),
      });

      if (!res) return;
      const data = await res.json();

      if (!res.ok) {
        setCoordFormError(data.message || "Failed to save coordinate");
        return;
      }

      setCoordForm({ label: "", x: "", y: "", z: "", category: "base", notes: "" });
      setShowCoordForm(false);
      await fetchCoordinates(worldId);
    } catch {
      setCoordFormError("Something went wrong. Please try again.");
    } finally {
      setCoordSubmitting(false);
    }
  }

  async function handleDeleteCoordinate(coordId) {
    setCoordDeletingId(coordId);
    try {
      const res = await fetchWithAuthRetry(`/api/coordinates/delete/${coordId}`, {
        method: "DELETE",
      });
      if (!res) return;
      if (res.ok) {
        await fetchCoordinates(worldId);
      }
    } catch {
      console.error("Failed to delete coordinate");
    } finally {
      setCoordDeletingId(null);
    }
  }

  function handleCopyCoord(coord) {
    navigator.clipboard.writeText(`${coord.x} ${coord.y} ${coord.z}`);
    setCopiedCoordId(coord._id);
    setTimeout(() => setCopiedCoordId(null), 2000);
  }

  // Auto scroll to coordinate form inside left panel when opened
  useEffect(() => {
    if (showCoordForm && coordFormRef.current) {
      coordFormRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [showCoordForm]);

  useEffect(() => {
    async function fetchWorld() {
      try {
        const { id } = await params;
        setWorldId(id);

        const res = await fetchWithAuthRetry(`/api/worlds/${id}`);

        if (!res) {
          return;
        }

        if (res.status === 404) {
          setError("World not found");
          return;
        }

        if (!res.ok) {
          setError("Failed to load world");
          return;
        }

        const data = await res.json();
        setWorld(data.world);

        await fetchMemories(id);
        await fetchCoordinates(id);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchWorld();
  }, [params, fetchMemories, fetchCoordinates, fetchWithAuthRetry]);

  function formatDate(dateStr) {
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

  function handleMemoryFormChange(e) {
    setMemoryForm({ ...memoryForm, [e.target.name]: e.target.value });
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  }

  async function handleAddMemory(e) {
    e.preventDefault();
    setMemoryFormError("");
    setSubmitting(true);

    try {
      let imageUrl = "";

      // Upload image if selected
      if (imageFile) {
        const compressed = await compressImage(imageFile);
        const formData = new FormData();
        formData.append("file", compressed);

        const uploadRes = await fetchWithAuthRetry("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes) {
          return;
        }

        let uploadData;
        try {
          uploadData = await uploadRes.json();
        } catch {
          const text = await uploadRes.text().catch(() => "");
          if (uploadRes.status === 413 || text.includes("Request Entity Too Large")) {
            setMemoryFormError("File size is too large to upload. Please select a smaller screenshot.");
          } else {
            setMemoryFormError(`Image upload failed (${uploadRes.status}).`);
          }
          return;
        }

        if (!uploadRes.ok) {
          setMemoryFormError(uploadData.message || "Image upload failed");
          return;
        }

        imageUrl = uploadData.imageUrl;
      }

      const res = await fetchWithAuthRetry("/api/memories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...memoryForm, worldId, imageUrl: imageUrl || undefined }),
      });

      if (!res) {
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setMemoryFormError(data.message || "Failed to add memory");
        return;
      }

      setMemoryForm({
        title: "",
        category: "achievement",
        description: "",
        memoryDate: "",
      });
      setImageFile(null);
      setImagePreview(null);
      setShowMemoryForm(false);
      await fetchMemories(worldId);
    } catch {
      setMemoryFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDeleteMemory() {
    if (!memoryToDelete) return;
    const memoryId = memoryToDelete._id;
    setDeletingId(memoryId);
    setMemoryToDelete(null);

    try {
      const res = await fetchWithAuthRetry(`/api/memories/delete/${memoryId}`, {
        method: "DELETE",
      });

      if (res && res.ok) {
        await fetchMemories(worldId);
      }
    } catch {
      console.error("Failed to delete memory");
    } finally {
      setDeletingId(null);
    }
  }

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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 gap-4">
        <p className="text-red-400 text-lg">{error}</p>
        <Link
          href="/dashboard"
          className="text-emerald-400 hover:underline text-sm"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!world) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-gray-400 text-lg">Loading world...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">

      {/* ═══════════════════════════════════════
          LAYER 0 — BREATHING BACKGROUND IMAGE
      ═══════════════════════════════════════ */}
      <motion.div
        className="fixed inset-0"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50% 40%", zIndex: 0 }}
      >
        <img
          src="/enhanced-mc-art.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
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
              rgba(8,4,1,0.75) 0%,
              rgba(12,7,2,0.5) 30%,
              rgba(10,6,2,0.45) 60%,
              rgba(8,4,1,0.8) 100%
            )
          `,
        }}
      />

      {/* ═══════════════════════════════════════
          LAYER 2 — WARM AMBIENT GLOW
      ═══════════════════════════════════════ */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255,180,60,0.08) 0%, rgba(255,140,30,0.03) 40%, transparent 70%)",
        }}
        animate={{ opacity: [1, 0.75, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ═══════════════════════════════════════
          LAYER 3 — VIGNETTE (DARK EDGES)
      ═══════════════════════════════════════ */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          background:
            "radial-gradient(ellipse 70% 65% at 50% 45%, transparent 30%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* ═══════════════════════════════════════
          LAYER 4 — PIXEL PARTICLES
      ═══════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none opacity-40" style={{ zIndex: 4 }}>
        <PixelParticles count={16} />
      </div>

      {/* ═══════════════════════════════════════
          CONTENT
      ═══════════════════════════════════════ */}
      <div className="relative px-4 py-10 min-h-screen" style={{ zIndex: 10 }}>
        <div className="max-w-7xl mx-auto">
          {/* Back Link */}
          <Link
            href="/dashboard"
            className="inline-block mb-6 text-sm transition-colors"
            style={{
              color: "rgba(255,224,176,0.5)",
              textShadow: "0 1px 6px rgba(0,0,0,0.6)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255,224,176,0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,224,176,0.5)";
            }}
          >
            ← Back to Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* ════════ LEFT PANEL (40%) — World Details & Coordinates ════════ */}
            <div className="w-full lg:w-[40%] sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto pr-1 custom-scrollbar space-y-5">

              {/* World Header */}
              <motion.div
                className="backdrop-blur-lg rounded-xl p-6"
                style={{
                  backgroundColor: "rgba(0,0,0,0.45)",
                  border: "1px solid rgba(218,165,32,0.15)",
                  boxShadow:
                    "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,100,0.03)",
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h1
                      className="text-2xl font-bold text-amber-100"
                      style={{
                        textShadow:
                          "0 2px 16px rgba(0,0,0,0.8), 0 0 30px rgba(255,170,60,0.08)",
                      }}
                    >
                      {world.name}
                    </h1>
                    <button
                      onClick={() => setIsEditWorldOpen(true)}
                      title="Edit World Details"
                      aria-label="Edit World Details"
                      className="p-1.5 rounded bg-black/40 hover:bg-amber-500/20 text-amber-200/50 hover:text-amber-200 border border-white/10 hover:border-amber-500/40 transition-all duration-150 shrink-0"
                    >
                      <Pencil size={15} />
                    </button>
                  </div>
                  {world.endedAt && (
                    <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                      Ended
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p
                      className="mb-0.5"
                      style={{ color: "rgba(255,224,176,0.4)" }}
                    >
                      Version
                    </p>
                    <p
                      style={{
                        color: "rgba(255,224,176,0.8)",
                        textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                      }}
                    >
                      {world.mcVersion}
                    </p>
                  </div>
                  <div>
                    <p
                      className="mb-0.5"
                      style={{ color: "rgba(255,224,176,0.4)" }}
                    >
                      Mode
                    </p>
                    <p
                      className="capitalize"
                      style={{
                        color: "rgba(255,224,176,0.8)",
                        textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                      }}
                    >
                      {world.mode}
                    </p>
                  </div>
                  <div>
                    <p
                      className="mb-0.5"
                      style={{ color: "rgba(255,224,176,0.4)" }}
                    >
                      Type
                    </p>
                    <p
                      className="capitalize"
                      style={{
                        color: "rgba(255,224,176,0.8)",
                        textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                      }}
                    >
                      {world.type}
                    </p>
                  </div>
                  {world.seed && (
                    <div>
                      <p
                        className="mb-0.5"
                        style={{ color: "rgba(255,224,176,0.4)" }}
                      >
                        Seed
                      </p>
                      <p
                        className="font-mono text-xs"
                        style={{
                          color: "rgba(255,224,176,0.8)",
                          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                        }}
                      >
                        {world.seed}
                      </p>
                    </div>
                  )}
                  <div>
                    <p
                      className="mb-0.5"
                      style={{ color: "rgba(255,224,176,0.4)" }}
                    >
                      Started
                    </p>
                    <p
                      style={{
                        color: "rgba(255,224,176,0.8)",
                        textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                      }}
                    >
                      {formatDate(world.startedAt)}
                    </p>
                  </div>
                  <div>
                    <p
                      className="mb-0.5"
                      style={{ color: "rgba(255,224,176,0.4)" }}
                    >
                      Playtime
                    </p>
                    <p
                      style={{
                        color: "rgba(255,224,176,0.8)",
                        textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                      }}
                    >
                      {formatPlaytime(world.playtimeMinutes)}
                    </p>
                  </div>
                  {world.endedAt && (
                    <div>
                      <p
                        className="mb-0.5"
                        style={{ color: "rgba(255,224,176,0.4)" }}
                      >
                        Ended
                      </p>
                      <p
                        style={{
                          color: "rgba(255,224,176,0.8)",
                          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                        }}
                      >
                        {formatDate(world.endedAt)}
                      </p>
                    </div>
                  )}
                </div>

                {/* End Details */}
                {world.endedAt && (world.endReason || world.finalMessage) && (
                  <div
                    className="mt-5 pt-5 space-y-3"
                    style={{ borderTop: "1px solid rgba(218,165,32,0.12)" }}
                  >
                    {world.endReason && (
                      <div>
                        <p
                          className="text-sm mb-1"
                          style={{ color: "rgba(255,224,176,0.4)" }}
                        >
                          End Reason
                        </p>
                        <p
                          className="text-sm"
                          style={{
                            color: "rgba(255,224,176,0.8)",
                            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                          }}
                        >
                          {world.endReason}
                        </p>
                      </div>
                    )}
                    {world.finalMessage && (
                      <div>
                        <p
                          className="text-sm mb-1"
                          style={{ color: "rgba(255,224,176,0.4)" }}
                        >
                          Final Message
                        </p>
                        <p
                          className="text-sm italic"
                          style={{
                            color: "rgba(255,224,176,0.8)",
                            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                          }}
                        >
                          &ldquo;{world.finalMessage}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Visibility Toggle */}
                <div
                  className="mt-5 pt-5"
                  style={{ borderTop: "1px solid rgba(218,165,32,0.12)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "rgba(255,224,176,0.6)" }}
                      >
                        {world.isPublic ? "Public" : "Private"}
                      </span>

                      {/* Toggle Switch */}
                      <button
                        disabled={sharingLoading}
                        onClick={async () => {
                          setSharingLoading(true);
                          try {
                            const res = await fetchWithAuthRetry(`/api/worlds/toggle-public/${worldId}`, {
                              method: "PATCH",
                            });
                            if (!res) return;
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.message || "Failed");
                            setWorld((prev) => ({
                              ...prev,
                              isPublic: data.isPublic,
                              shareToken: data.shareUrl
                                ? data.shareUrl.replace("/share/", "")
                                : prev.shareToken,
                            }));
                          } catch (err) {
                            console.error("Toggle failed:", err.message);
                          } finally {
                            setSharingLoading(false);
                          }
                        }}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-50"
                        style={{
                          backgroundColor: world.isPublic
                            ? "rgba(34,197,94,0.5)"
                            : "rgba(255,255,255,0.12)",
                          border: world.isPublic
                            ? "1px solid rgba(34,197,94,0.4)"
                            : "1px solid rgba(255,255,255,0.15)",
                        }}
                        aria-label="Toggle world visibility"
                      >
                        <span
                          className="inline-block h-4 w-4 rounded-full transition-transform duration-300"
                          style={{
                            backgroundColor: world.isPublic ? "#22c55e" : "rgba(255,255,255,0.45)",
                            transform: world.isPublic ? "translateX(22px)" : "translateX(4px)",
                            boxShadow: world.isPublic
                              ? "0 0 8px rgba(34,197,94,0.5)"
                              : "none",
                          }}
                        />
                      </button>
                    </div>

                    <p
                      className="text-xs"
                      style={{ color: "rgba(255,224,176,0.3)" }}
                    >
                      Public worlds are accessible only via link.
                    </p>
                  </div>

                  {/* Share Link (visible only when public) */}
                  <AnimatePresence>
                    {world.isPublic && world.shareToken && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2 mt-1">
                          <code
                            className="flex-1 px-3 py-2 rounded-lg text-sm truncate"
                            style={{
                              backgroundColor: "rgba(0,0,0,0.35)",
                              border: "1px solid rgba(218,165,32,0.12)",
                              color: "#6ee7b7",
                            }}
                          >
                            {typeof window !== "undefined"
                              ? `${window.location.origin}/share/${world.shareToken}`
                              : `/share/${world.shareToken}`}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/share/${world.shareToken}`
                              );
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="shrink-0 px-3 py-2 text-sm rounded-lg transition-all"
                            style={{
                              color: "#fff",
                              backgroundColor: "rgba(16,185,129,0.6)",
                              border: "1px solid rgba(16,185,129,0.3)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.8)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.6)";
                            }}
                          >
                            {copied ? "Copied!" : "Copy Link"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Activity Heatmap */}
              <div className="mt-5">
                <ActivityHeatmap worldId={worldId} />
              </div>

              {/* ════════ COORDINATE TRACKER ════════ */}
              <motion.div
                className="mt-5 backdrop-blur-lg rounded-xl p-5"
                style={{
                  backgroundColor: "rgba(0,0,0,0.45)",
                  border: "1px solid rgba(218,165,32,0.15)",
                  boxShadow:
                    "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,100,0.03)",
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-base font-semibold flex items-center gap-2"
                    style={{
                      color: "rgba(255,224,176,0.95)",
                      textShadow:
                        "0 0 15px rgba(218,165,32,0.4), 0 2px 6px rgba(0,0,0,0.7)",
                    }}
                  >
                    <span>📍</span> Saved Coordinates
                    {coordinates.length > 0 && (
                      <span
                        className="text-xs font-normal px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "rgba(218,165,32,0.15)",
                          color: "rgba(255,224,176,0.6)",
                        }}
                      >
                        {coordinates.length}
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={() => setShowCoordForm(!showCoordForm)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                    style={{
                      backgroundColor: showCoordForm
                        ? "rgba(239,68,68,0.3)"
                        : "rgba(16,185,129,0.5)",
                      border: showCoordForm
                        ? "1px solid rgba(239,68,68,0.3)"
                        : "1px solid rgba(16,185,129,0.3)",
                      color: "#fff",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = showCoordForm
                        ? "rgba(239,68,68,0.5)"
                        : "rgba(16,185,129,0.7)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = showCoordForm
                        ? "rgba(239,68,68,0.3)"
                        : "rgba(16,185,129,0.5)";
                    }}
                  >
                    {showCoordForm ? "Cancel" : "+ Add"}
                  </button>
                </div>

                {/* Add Coordinate Form */}
                <AnimatePresence>
                  {showCoordForm && (
                    <motion.div
                      ref={coordFormRef}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="mb-4 p-4 rounded-xl"
                        style={{
                          backgroundColor: "rgba(0,0,0,0.35)",
                          border: "1px solid rgba(218,165,32,0.12)",
                        }}
                      >
                        {coordFormError && (
                          <div
                            className="mb-3 p-2.5 rounded-lg text-xs"
                            style={{
                              backgroundColor: "rgba(239,68,68,0.1)",
                              border: "1px solid rgba(239,68,68,0.3)",
                              color: "#fca5a5",
                            }}
                          >
                            {coordFormError}
                          </div>
                        )}

                        <form onSubmit={handleAddCoordinate} className="space-y-3">
                          {/* Label */}
                          <div>
                            <label
                              htmlFor="coordLabel"
                              className="block text-xs mb-1"
                              style={{ color: "rgba(255,224,176,0.6)" }}
                            >
                              Label *
                            </label>
                            <input
                              id="coordLabel"
                              type="text"
                              required
                              value={coordForm.label}
                              onChange={(e) =>
                                setCoordForm({ ...coordForm, label: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                              style={{
                                backgroundColor: "rgba(0,0,0,0.35)",
                                border: "1px solid rgba(218,165,32,0.15)",
                                color: "rgba(255,224,176,0.9)",
                              }}
                              placeholder="My Base"
                              onFocus={(e) => {
                                e.target.style.borderColor = "rgba(16,185,129,0.5)";
                                e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "rgba(218,165,32,0.15)";
                                e.target.style.boxShadow = "none";
                              }}
                            />
                          </div>

                          {/* X, Y, Z in a row */}
                          <div className="grid grid-cols-3 gap-2">
                            {["x", "y", "z"].map((axis) => (
                              <div key={axis}>
                                <label
                                  htmlFor={`coord${axis.toUpperCase()}`}
                                  className="block text-xs mb-1 uppercase font-mono"
                                  style={{ color: "rgba(255,224,176,0.5)" }}
                                >
                                  {axis}
                                </label>
                                <input
                                  id={`coord${axis.toUpperCase()}`}
                                  type="number"
                                  required
                                  value={coordForm[axis]}
                                  onChange={(e) =>
                                    setCoordForm({ ...coordForm, [axis]: e.target.value })
                                  }
                                  className="w-full px-3 py-2 rounded-lg text-sm font-mono transition-all focus:outline-none focus:ring-2"
                                  style={{
                                    backgroundColor: "rgba(0,0,0,0.35)",
                                    border: "1px solid rgba(218,165,32,0.15)",
                                    color: "rgba(255,224,176,0.9)",
                                  }}
                                  placeholder="0"
                                  onFocus={(e) => {
                                    e.target.style.borderColor = "rgba(16,185,129,0.5)";
                                    e.target.style.boxShadow =
                                      "0 0 0 3px rgba(16,185,129,0.1)";
                                  }}
                                  onBlur={(e) => {
                                    e.target.style.borderColor = "rgba(218,165,32,0.15)";
                                    e.target.style.boxShadow = "none";
                                  }}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Category */}
                          <div>
                            <label
                              htmlFor="coordCategory"
                              className="block text-xs mb-1"
                              style={{ color: "rgba(255,224,176,0.6)" }}
                            >
                              Category *
                            </label>
                            <select
                              id="coordCategory"
                              required
                              value={coordForm.category}
                              onChange={(e) =>
                                setCoordForm({ ...coordForm, category: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 capitalize"
                              style={{
                                backgroundColor: "rgba(0,0,0,0.35)",
                                border: "1px solid rgba(218,165,32,0.15)",
                                color: "rgba(255,224,176,0.9)",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = "rgba(16,185,129,0.5)";
                                e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "rgba(218,165,32,0.15)";
                                e.target.style.boxShadow = "none";
                              }}
                            >
                              {COORD_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {COORD_CATEGORY_COLORS[cat].emoji}{" "}
                                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Notes */}
                          <div>
                            <label
                              htmlFor="coordNotes"
                              className="block text-xs mb-1"
                              style={{ color: "rgba(255,224,176,0.6)" }}
                            >
                              Notes (optional)
                            </label>
                            <textarea
                              id="coordNotes"
                              rows={2}
                              value={coordForm.notes}
                              onChange={(e) =>
                                setCoordForm({ ...coordForm, notes: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 resize-none"
                              style={{
                                backgroundColor: "rgba(0,0,0,0.35)",
                                border: "1px solid rgba(218,165,32,0.15)",
                                color: "rgba(255,224,176,0.9)",
                              }}
                              placeholder="Near the ravine..."
                              onFocus={(e) => {
                                e.target.style.borderColor = "rgba(16,185,129,0.5)";
                                e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "rgba(218,165,32,0.15)";
                                e.target.style.boxShadow = "none";
                              }}
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={coordSubmitting}
                            className="w-full px-4 py-2 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: "rgba(16,185,129,0.6)",
                              border: "1px solid rgba(16,185,129,0.3)",
                              boxShadow: "0 2px 10px rgba(16,185,129,0.25)",
                            }}
                            onMouseEnter={(e) => {
                              if (!coordSubmitting)
                                e.currentTarget.style.backgroundColor =
                                  "rgba(16,185,129,0.75)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "rgba(16,185,129,0.6)";
                            }}
                          >
                            {coordSubmitting ? "Saving..." : "Save Coordinate"}
                          </button>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Coordinate List */}
                {coordinates.length === 0 ? (
                  <p
                    className="text-xs text-center py-3"
                    style={{ color: "rgba(255,224,176,0.4)" }}
                  >
                    No coordinates saved yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {coordinates.map((coord) => {
                      const cat = COORD_CATEGORY_COLORS[coord.category] || COORD_CATEGORY_COLORS.other;
                      return (
                        <motion.div
                          key={coord._id}
                          className="rounded-lg p-3 transition-all"
                          style={{
                            backgroundColor: "rgba(0,0,0,0.3)",
                            border: "1px solid rgba(218,165,32,0.1)",
                          }}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{
                            borderColor: "rgba(218,165,32,0.25)",
                          }}
                        >
                          {/* Top row: label + category badge */}
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="font-medium text-sm truncate"
                                style={{
                                  color: "rgba(255,224,176,0.9)",
                                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                                }}
                              >
                                {coord.label}
                              </span>
                              <span
                                className="shrink-0 text-xs px-1.5 py-0.5 rounded capitalize"
                                style={{
                                  backgroundColor: cat.bg,
                                  border: `1px solid ${cat.border}`,
                                  color: cat.text,
                                }}
                              >
                                {cat.emoji} {coord.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleCopyCoord(coord)}
                                className="px-2 py-0.5 text-xs rounded transition-all"
                                style={{ color: "rgba(255,224,176,0.5)" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = "#6ee7b7";
                                  e.currentTarget.style.backgroundColor =
                                    "rgba(16,185,129,0.1)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = "rgba(255,224,176,0.5)";
                                  e.currentTarget.style.backgroundColor = "transparent";
                                }}
                              >
                                {copiedCoordId === coord._id ? "✓" : "Copy"}
                              </button>
                              <button
                                onClick={() => handleDeleteCoordinate(coord._id)}
                                disabled={coordDeletingId === coord._id}
                                className="px-2 py-0.5 text-xs rounded transition-all disabled:opacity-50"
                                style={{ color: "rgba(255,224,176,0.5)" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = "#fca5a5";
                                  e.currentTarget.style.backgroundColor =
                                    "rgba(239,68,68,0.1)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = "rgba(255,224,176,0.5)";
                                  e.currentTarget.style.backgroundColor = "transparent";
                                }}
                              >
                                {coordDeletingId === coord._id ? "..." : "Del"}
                              </button>
                            </div>
                          </div>

                          {/* Coordinates in monospace */}
                          <p
                            className="font-mono text-xs mb-1"
                            style={{ color: "rgba(255,224,176,0.7)" }}
                          >
                            X: {coord.x} &nbsp; Y: {coord.y} &nbsp; Z: {coord.z}
                          </p>

                          {/* Notes */}
                          {coord.notes && (
                            <p
                              className="text-xs italic"
                              style={{ color: "rgba(255,224,176,0.45)" }}
                            >
                              {coord.notes}
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

            </div>
            {/* ════════ RIGHT PANEL (60%) — Memories ════════ */}
            <div className="w-full lg:w-[60%]">

              {/* Memories Section */}
              <motion.div
                className="backdrop-blur-lg rounded-xl p-6"
                style={{
                  backgroundColor: "rgba(0,0,0,0.45)",
                  border: "1px solid rgba(218,165,32,0.15)",
                  boxShadow:
                    "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,100,0.03)",
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="text-xl font-semibold"
                    style={{
                      color: "rgba(255,224,176,0.95)",
                      textShadow:
                        "0 0 15px rgba(218,165,32,0.4), 0 2px 6px rgba(0,0,0,0.7)",
                    }}
                  >
                    Memories
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsTrashOpen(true)}
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-colors border flex items-center gap-1.5"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.3)",
                        borderColor: "rgba(218,165,32,0.18)",
                        color: "rgba(255,224,176,0.7)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
                        e.currentTarget.style.borderColor = "rgba(218,165,32,0.35)";
                        e.currentTarget.style.color = "rgba(255,224,176,0.95)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.3)";
                        e.currentTarget.style.borderColor = "rgba(218,165,32,0.18)";
                        e.currentTarget.style.color = "rgba(255,224,176,0.7)";
                      }}
                    >
                      🗑 Trash
                    </button>
                    {memories.length > 0 && (
                      <button
                        onClick={() => setShowCinematic(true)}
                        className="px-4 py-2 text-sm font-medium rounded-lg transition-colors border"
                        style={{
                          backgroundColor: "rgba(160,100,30,0.25)",
                          borderColor: "rgba(218,165,32,0.3)",
                          color: "#ffd896",
                          textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(160,100,30,0.45)";
                          e.currentTarget.style.borderColor = "rgba(218,165,32,0.5)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(160,100,30,0.25)";
                          e.currentTarget.style.borderColor = "rgba(218,165,32,0.3)";
                        }}
                      >
                        ▶ Cinematic Mode
                      </button>
                    )}
                    <button
                      onClick={() => setShowMemoryForm(!showMemoryForm)}
                      className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-all"
                      style={{
                        backgroundColor: "rgba(16,185,129,0.6)",
                        border: "1px solid rgba(16,185,129,0.3)",
                        boxShadow: "0 2px 10px rgba(16,185,129,0.25)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.75)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.6)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {showMemoryForm ? "Cancel" : "+ Add Memory"}
                    </button>
                  </div>
                </div>

                {/* Add Memory Form */}
                {showMemoryForm && (
                  <div
                    className="mb-6 p-5 rounded-xl"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(218,165,32,0.12)",
                    }}
                  >
                    <h3
                      className="text-sm font-medium mb-4"
                      style={{ color: "rgba(255,224,176,0.8)" }}
                    >
                      New Memory
                    </h3>

                    {memoryFormError && (
                      <div
                        className="mb-4 p-3 rounded-lg text-sm"
                        style={{
                          backgroundColor: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          color: "#fca5a5",
                        }}
                      >
                        {memoryFormError}
                      </div>
                    )}

                    <form onSubmit={handleAddMemory} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="title"
                            className="block text-sm mb-1"
                            style={{ color: "rgba(255,224,176,0.6)" }}
                          >
                            Title *
                          </label>
                          <input
                            id="title"
                            name="title"
                            type="text"
                            required
                            value={memoryForm.title}
                            onChange={handleMemoryFormChange}
                            className="w-full px-4 py-2.5 rounded-lg transition-all focus:outline-none focus:ring-2"
                            style={{
                              backgroundColor: "rgba(0,0,0,0.35)",
                              border: "1px solid rgba(218,165,32,0.15)",
                              color: "rgba(255,224,176,0.9)",
                            }}
                            placeholder="First diamond!"
                            onFocus={(e) => {
                              e.target.style.borderColor = "rgba(16,185,129,0.5)";
                              e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "rgba(218,165,32,0.15)";
                              e.target.style.boxShadow = "none";
                            }}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="category"
                            className="block text-sm mb-1"
                            style={{ color: "rgba(255,224,176,0.6)" }}
                          >
                            Category *
                          </label>
                          <select
                            id="category"
                            name="category"
                            required
                            value={memoryForm.category}
                            onChange={handleMemoryFormChange}
                            className="w-full px-4 py-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 capitalize"
                            style={{
                              backgroundColor: "rgba(0,0,0,0.35)",
                              border: "1px solid rgba(218,165,32,0.15)",
                              color: "rgba(255,224,176,0.9)",
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = "rgba(16,185,129,0.5)";
                              e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "rgba(218,165,32,0.15)";
                              e.target.style.boxShadow = "none";
                            }}
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="memoryDate"
                            className="block text-sm mb-1"
                            style={{ color: "rgba(255,224,176,0.6)" }}
                          >
                            Date *
                          </label>
                          <input
                            id="memoryDate"
                            name="memoryDate"
                            type="date"
                            required
                            value={memoryForm.memoryDate}
                            onChange={handleMemoryFormChange}
                            className="w-full px-4 py-2.5 rounded-lg transition-all focus:outline-none focus:ring-2"
                            style={{
                              backgroundColor: "rgba(0,0,0,0.35)",
                              border: "1px solid rgba(218,165,32,0.15)",
                              color: "rgba(255,224,176,0.9)",
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = "rgba(16,185,129,0.5)";
                              e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "rgba(218,165,32,0.15)";
                              e.target.style.boxShadow = "none";
                            }}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="imageFile"
                            className="block text-sm mb-1"
                            style={{ color: "rgba(255,224,176,0.6)" }}
                          >
                            Screenshot (optional)
                          </label>
                          <input
                            id="imageFile"
                            name="imageFile"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:cursor-pointer cursor-pointer"
                            style={{
                              color: "rgba(255,224,176,0.7)",
                            }}
                          />
                        </div>
                      </div>

                      {imagePreview && (
                        <div>
                          <p
                            className="text-sm mb-1"
                            style={{ color: "rgba(255,224,176,0.6)" }}
                          >
                            Preview
                          </p>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-48 rounded-lg object-cover"
                            style={{ border: "1px solid rgba(218,165,32,0.2)" }}
                          />
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm mb-1"
                          style={{ color: "rgba(255,224,176,0.6)" }}
                        >
                          Description (optional)
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          value={memoryForm.description}
                          onChange={handleMemoryFormChange}
                          className="w-full px-4 py-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 resize-none"
                          style={{
                            backgroundColor: "rgba(0,0,0,0.35)",
                            border: "1px solid rgba(218,165,32,0.15)",
                            color: "rgba(255,224,176,0.9)",
                          }}
                          placeholder="What happened?"
                          onFocus={(e) => {
                            e.target.style.borderColor = "rgba(16,185,129,0.5)";
                            e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "rgba(218,165,32,0.15)";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: "rgba(16,185,129,0.6)",
                          border: "1px solid rgba(16,185,129,0.3)",
                          boxShadow: "0 2px 10px rgba(16,185,129,0.25)",
                        }}
                        onMouseEnter={(e) => {
                          if (!submitting) {
                            e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.75)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.6)";
                        }}
                      >
                        {submitting ? (imageFile ? "Uploading..." : "Adding...") : "Add Memory"}
                      </button>
                    </form>
                  </div>
                )}

                {/* Timeline */}
                {orderedMemories.length === 0 ? (
                  <p className="text-sm" style={{ color: "rgba(255,224,176,0.5)" }}>
                    No memories yet. Add your first memory to start the timeline.
                  </p>
                ) : (
                  <div
                    className="relative ml-3 pl-6 space-y-6"
                    style={{ borderLeft: "2px solid rgba(218,165,32,0.15)" }}
                  >
                    {orderedMemories.map((memory) => (
                      <div key={memory._id} className="relative group">
                        {/* Timeline dot */}
                        <div
                          className="absolute -left-8.25 top-1 w-3 h-3 rounded-full transition-all"
                          style={{
                            backgroundColor: "rgba(0,0,0,0.5)",
                            border: "2px solid rgba(218,165,32,0.4)",
                          }}
                        />

                        <div
                          className="backdrop-blur-sm rounded-xl p-4 transition-all"
                          style={{
                            backgroundColor: "rgba(0,0,0,0.35)",
                            border: "1px solid rgba(218,165,32,0.12)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "rgba(218,165,32,0.25)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "rgba(218,165,32,0.12)";
                          }}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3
                                className="font-medium"
                                style={{
                                  color: "rgba(255,224,176,0.9)",
                                  textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                                }}
                              >
                                {memory.title}
                              </h3>
                              <span
                                className={`inline-block px-2 py-0.5 border rounded text-xs capitalize ${CATEGORY_COLORS[memory.category] ||
                                  "bg-gray-500/10 border-gray-500/30 text-gray-400"
                                  }`}
                              >
                                {memory.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingMemory(memory)}
                                disabled={deletingId === memory._id}
                                className="shrink-0 px-2 py-1 text-xs rounded transition-all disabled:opacity-50"
                                style={{ color: "rgba(255,224,176,0.5)" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = "#93c5fd";
                                  e.currentTarget.style.backgroundColor = "rgba(59,130,246,0.1)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = "rgba(255,224,176,0.5)";
                                  e.currentTarget.style.backgroundColor = "transparent";
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setMemoryToDelete(memory)}
                                disabled={deletingId === memory._id}
                                className="shrink-0 px-2 py-1 text-xs rounded transition-all disabled:opacity-50"
                                style={{ color: "rgba(255,224,176,0.5)" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = "#fca5a5";
                                  e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = "rgba(255,224,176,0.5)";
                                  e.currentTarget.style.backgroundColor = "transparent";
                                }}
                              >
                                {deletingId === memory._id ? "..." : "Delete"}
                              </button>
                            </div>
                          </div>

                          {/* Date */}
                          <p
                            className="text-xs mb-2"
                            style={{ color: "rgba(255,224,176,0.5)" }}
                          >
                            {formatDate(memory.memoryDate)}
                          </p>

                          {/* Description */}
                          {memory.description && (
                            <p
                              className="text-sm mb-3"
                              style={{ color: "rgba(255,224,176,0.7)" }}
                            >
                              {memory.description}
                            </p>
                          )}

                          {/* Image */}
                          {memory.imageUrl && (
                            <img
                              src={memory.imageUrl}
                              alt={memory.title}
                              className="w-full max-h-64 object-cover rounded-lg"
                              style={{ border: "1px solid rgba(218,165,32,0.2)" }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

            </div>
          </div>
        </div>
      </div>

      {/* Edit Memory Modal */}
      <AnimatePresence>
        {editingMemory && (
          <EditMemoryModal
            memory={editingMemory}
            onClose={() => setEditingMemory(null)}
            onSaved={(updated) => {
              setMemories((prev) =>
                prev.map((m) => (m._id === updated._id ? updated : m))
              );
              setEditingMemory(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Cinematic Mode Overlay */}
      <AnimatePresence>
        {showCinematic && memories.length > 0 && (
          <CinematicMode
            memories={memories}
            onClose={() => setShowCinematic(false)}
          />
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!memoryToDelete}
        onClose={() => setMemoryToDelete(null)}
        onConfirm={confirmDeleteMemory}
      />

      {/* Trash Bin Modal */}
      <TrashBinModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        worldId={worldId}
        onRefreshRequired={() => fetchMemories(worldId)}
        fetchWithAuthRetry={fetchWithAuthRetry}
      />

      {/* Edit World Modal */}
      <EditWorldModal
        isOpen={isEditWorldOpen}
        world={world}
        onClose={() => setIsEditWorldOpen(false)}
        onSaved={(updated) => {
          setWorld((prev) => ({ ...prev, ...updated }));
        }}
      />
    </div>
  );
}
