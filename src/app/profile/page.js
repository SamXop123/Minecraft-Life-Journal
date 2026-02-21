"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import PixelParticles from "@/components/PixelParticles";
import EditProfileModal from "@/components/EditProfileModal";

const LEVEL_LABELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  veteran: "Veteran",
};

const LEVEL_COLORS = {
  beginner: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", text: "#86efac" },
  intermediate: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", text: "#93c5fd" },
  veteran: { bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.3)", text: "#c4b5fd" },
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  async function fetchProfile() {
    let token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      let res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      /* ── Token expired: try silent refresh ── */
      if (res.status === 401) {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
        });

        if (!refreshRes.ok) {
          localStorage.removeItem("accessToken");
          router.push("/login");
          return;
        }

        const refreshData = await refreshRes.json();
        token = refreshData.accessToken;
        localStorage.setItem("accessToken", token);

        /* Retry with new token */
        res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setProfile(data.profile);
    } catch (err) {
      console.error("Failed to fetch profile:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#1a1008" }}
      >
        <motion.p
          className="text-amber-200/60 text-lg"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Loading profile...
        </motion.p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "#1a1008" }}
      >
        <p style={{ color: "rgba(255,224,176,0.6)" }}>Could not load profile.</p>
        <Link
          href="/dashboard"
          className="text-sm underline"
          style={{ color: "rgba(255,224,176,0.5)" }}
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const lvl = LEVEL_COLORS[profile.experienceLevel] || null;

