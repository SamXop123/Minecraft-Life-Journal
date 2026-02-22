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

