"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import CinematicMode from "@/components/CinematicMode";
import PixelParticles from "@/components/PixelParticles";
import EditMemoryModal from "@/components/EditMemoryModal";

const CATEGORIES = ["achievement", "build", "death", "funny", "emotional"];

const CATEGORY_COLORS = {
  achievement: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  build: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  death: "bg-red-500/10 border-red-500/30 text-red-400",
  funny: "bg-pink-500/10 border-pink-500/30 text-pink-400",
  emotional: "bg-purple-500/10 border-purple-500/30 text-purple-400",
};

export default function WorldDetailPage({ params }) {
  const router = useRouter();
  const [world, setWorld] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  function getToken() {
    return localStorage.getItem("accessToken");
  }

  const fetchMemories = useCallback(
    async (id, token) => {
      try {
        const res = await fetch(`/api/memories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setMemories(data.memories || []);
        }
      } catch {
        console.error("Failed to fetch memories");
      }
    },
    []
  );

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchWorld() {
      try {
        const { id } = await params;
        setWorldId(id);

        const res = await fetch(`/api/worlds/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("accessToken");
          router.push("/login");
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

        await fetchMemories(id, token);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchWorld();
  }, [params, router, fetchMemories]);

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

    const token = getToken();

    try {
      let imageUrl = "";

      // Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          setMemoryFormError(uploadData.message || "Image upload failed");
          return;
        }

        imageUrl = uploadData.imageUrl;
      }

      const res = await fetch("/api/memories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...memoryForm, worldId, imageUrl: imageUrl || undefined }),
      });

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
      await fetchMemories(worldId, token);
    } catch {
      setMemoryFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteMemory(memoryId) {
    const token = getToken();
    setDeletingId(memoryId);

    try {
      const res = await fetch(`/api/memories/delete/${memoryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        await fetchMemories(worldId, token);
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
          src="/hd-treehouse-bg.jpg"
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
      <div className="max-w-3xl mx-auto">
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

        {/* World Header */}
        <motion.div
          className="backdrop-blur-lg rounded-xl p-6 mb-6"
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
            <h1
              className="text-2xl font-bold text-amber-100"
              style={{
                textShadow:
                  "0 2px 16px rgba(0,0,0,0.8), 0 0 30px rgba(255,170,60,0.08)",
              }}
            >
              {world.name}
            </h1>
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

