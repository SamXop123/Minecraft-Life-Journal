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

  return (
    <div className="relative min-h-screen">
      {/* Fixed background layers */}
      <motion.div
        className="fixed inset-0"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50% 40%", zIndex: 0 }}
      >
        <img
          src="/minecraft-hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </motion.div>

      <div
        className="fixed inset-0"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(8,4,1,0.8) 0%, rgba(12,7,2,0.55) 30%, rgba(10,6,2,0.5) 60%, rgba(8,4,1,0.85) 100%)",
        }}
      />

      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background:
            "radial-gradient(ellipse 50% 50% at 50% 25%, rgba(255,180,60,0.08) 0%, transparent 70%)",
        }}
        animate={{ opacity: [1, 0.75, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          background:
            "radial-gradient(ellipse 70% 65% at 50% 45%, transparent 30%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{ zIndex: 4 }}
      >
        <PixelParticles count={14} />
      </div>

      {/* Content */}
      <div className="relative px-4 py-10 min-h-screen" style={{ zIndex: 10 }}>
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <Link
            href="/dashboard"
            className="inline-block mb-6 text-sm transition-colors"
            style={{ color: "rgba(255,224,176,0.5)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255,224,176,0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,224,176,0.5)";
            }}
          >
            ← Back to Dashboard
          </Link>

          {/* Profile Card */}
          <motion.div
            className="backdrop-blur-lg rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(218,165,32,0.15)",
              boxShadow:
                "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,100,0.03)",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Top section with avatar */}
            <div
              className="px-6 pt-8 pb-6 flex flex-col items-center text-center"
              style={{ borderBottom: "1px solid rgba(218,165,32,0.1)" }}
            >
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-full overflow-hidden mb-4 flex items-center justify-center"
                style={{
                  border: "3px solid rgba(218,165,32,0.35)",
                  boxShadow:
                    "0 0 20px rgba(218,165,32,0.15), 0 4px 15px rgba(0,0,0,0.5)",
                  backgroundColor: "rgba(0,0,0,0.4)",
                }}
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className="text-3xl font-bold"
                    style={{ color: "rgba(255,224,176,0.4)" }}
                  >
                    {profile.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Username */}
              <h1
                className="text-2xl font-bold mb-1"
                style={{
                  color: "rgba(255,224,176,0.95)",
                  textShadow:
                    "0 0 20px rgba(218,165,32,0.35), 0 2px 8px rgba(0,0,0,0.7)",
                }}
              >
                {profile.username}
              </h1>

              {/* Display name */}
              {profile.displayName && (
                <p
                  className="text-sm mb-1"
                  style={{ color: "rgba(255,224,176,0.55)" }}
                >
                  {profile.displayName}
                </p>
              )}

              {/* Experience badge */}
              {profile.experienceLevel && lvl && (
                <span
                  className="inline-block px-3 py-0.5 rounded-full text-xs font-medium mt-2"
                  style={{
                    backgroundColor: lvl.bg,
                    border: `1px solid ${lvl.border}`,
                    color: lvl.text,
                  }}
                >
                  {LEVEL_LABELS[profile.experienceLevel]}
                </span>
              )}

              {/* Joined date */}
              <p
                className="text-xs mt-3"
                style={{ color: "rgba(255,224,176,0.35)" }}
              >
                Joined {formatDate(profile.joinedAt || profile.createdAt)}
              </p>
            </div>

            {/* Info grid */}
            <div className="px-6 py-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* Real Name */}
                <InfoItem label="Real Name" value={profile.realName} />
                {/* Age */}
                <InfoItem label="Age" value={profile.age} />
                {/* Country */}
                <InfoItem label="Country" value={profile.country} />
                {/* Email */}
                <InfoItem label="Email" value={profile.email} />
              </div>

              {/* Tags sections */}
              {profile.favoriteGameModes?.length > 0 && (
                <div className="mt-5">
                  <p
                    className="text-xs mb-2"
                    style={{ color: "rgba(255,224,176,0.4)" }}
                  >
                    Favorite Game Modes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.favoriteGameModes.map((mode) => (
                      <span
                        key={mode}
                        className="px-2.5 py-1 rounded text-xs"
                        style={{
                          backgroundColor: "rgba(218,165,32,0.1)",
                          border: "1px solid rgba(218,165,32,0.2)",
                          color: "rgba(255,224,176,0.75)",
                        }}
                      >
                        {mode}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.favoriteActivities?.length > 0 && (
                <div className="mt-4">
                  <p
                    className="text-xs mb-2"
                    style={{ color: "rgba(255,224,176,0.4)" }}
                  >
                    Favorite Activities
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.favoriteActivities.map((act) => (
                      <span
                        key={act}
                        className="px-2.5 py-1 rounded text-xs"
                        style={{
                          backgroundColor: "rgba(16,185,129,0.08)",
                          border: "1px solid rgba(16,185,129,0.2)",
                          color: "rgba(110,231,183,0.8)",
                        }}
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <div
                  className="mt-5 pt-5"
                  style={{ borderTop: "1px solid rgba(218,165,32,0.1)" }}
                >
                  <p
                    className="text-xs mb-2"
                    style={{ color: "rgba(255,224,176,0.4)" }}
                  >
                    Bio
                  </p>
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: "rgba(255,224,176,0.75)" }}
                  >
                    {profile.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Edit button */}
            <div
              className="px-6 py-4 flex justify-end"
              style={{ borderTop: "1px solid rgba(218,165,32,0.08)" }}
            >
              <button
                onClick={() => setShowEdit(true)}
                className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all"
                style={{
                  color: "#ffd896",
                  backgroundColor: "rgba(218,165,32,0.15)",
                  border: "1px solid rgba(218,165,32,0.25)",
                  boxShadow:
                    "0 2px 8px rgba(218,165,32,0.15), inset 0 1px 0 rgba(255,200,100,0.08)",
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(218,165,32,0.25)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(218,165,32,0.25), inset 0 1px 0 rgba(255,200,100,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(218,165,32,0.15)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(218,165,32,0.15), inset 0 1px 0 rgba(255,200,100,0.08)";
                }}
              >
                Edit Profile
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => {
            // Use the returned profile directly; re-fetch to confirm persisted state
            setProfile(updated);
            setShowEdit(false);
            fetchProfile();
          }}
        />
      )}
    </div>
  );
}

/* ── Reusable info display ── */
function InfoItem({ label, value }) {
  return (
    <div>
      <p
        className="text-xs mb-0.5"
        style={{ color: "rgba(255,224,176,0.4)" }}
      >
        {label}
      </p>
      <p
        className="text-sm"
        style={{
          color: value
            ? "rgba(255,224,176,0.8)"
            : "rgba(255,224,176,0.25)",
          textShadow: value ? "0 1px 4px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {value || "—"}
      </p>
    </div>
  );
}
