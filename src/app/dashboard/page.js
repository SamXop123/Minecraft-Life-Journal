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

