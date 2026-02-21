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

