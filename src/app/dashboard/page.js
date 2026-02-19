"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import PixelParticles from "@/components/PixelParticles";
import WorldCard from "@/components/WorldCard";

export default function DashboardPage() {
  const router = useRouter();
  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
    <div className="relative min-h-screen overflow-hidden">

      {/* ═══════════════════════════════════════
          LAYER 0 — BREATHING BACKGROUND IMAGE
      ═══════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50% 40%" }}
      >
        <img
          src="/minecraft-hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </motion.div>

      {/* ═══════════════════════════════════════
          LAYER 1 — DARK GRADIENT OVERLAY
      ═══════════════════════════════════════ */}
      <div
        className="absolute inset-0"
        style={{
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
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 65% 20%, rgba(255,180,60,0.12) 0%, rgba(255,140,30,0.04) 40%, transparent 70%)",
        }}
        animate={{ opacity: [1, 0.8, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ═══════════════════════════════════════
          LAYER 3 — VIGNETTE (DARK EDGES)
      ═══════════════════════════════════════ */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 50% 45%, transparent 35%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* ═══════════════════════════════════════
          LAYER 4 — PIXEL PARTICLES
      ═══════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <PixelParticles count={18} />
      </div>

      {/* ═══════════════════════════════════════
          CONTENT
      ═══════════════════════════════════════ */}
      <div className="relative z-10 px-4 py-10 min-h-screen">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <motion.h1
              className="text-3xl font-bold text-amber-100"
              style={{
                textShadow:
                  "0 2px 20px rgba(0,0,0,0.8), 0 0 40px rgba(255,170,60,0.1)",
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Your Worlds
            </motion.h1>
            <motion.button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: "rgba(160,100,30,0.55)",
                color: "#ffe0b0",
                border: "1px solid rgba(218,165,32,0.3)",
                boxShadow:
                  "0 2px 14px rgba(0,0,0,0.5), 0 0 10px rgba(255,170,60,0.08)",
                textShadow: "0 1px 4px rgba(0,0,0,0.6)",
              }}
              whileHover={{
                boxShadow:
                  "0 4px 20px rgba(0,0,0,0.6), 0 0 18px rgba(255,170,60,0.14)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(180,110,30,0.7)";
                e.currentTarget.style.borderColor = "rgba(218,165,32,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(160,100,30,0.55)";
                e.currentTarget.style.borderColor = "rgba(218,165,32,0.3)";
              }}
            >
              {showForm ? "Cancel" : "+ New World"}
            </motion.button>
          </div>

          {/* Create World Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                className="mb-8 backdrop-blur-lg rounded-xl p-6"
                style={{
                  backgroundColor: "rgba(0,0,0,0.45)",
                  border: "1px solid rgba(218,165,32,0.15)",
                  boxShadow:
