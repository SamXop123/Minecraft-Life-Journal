"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EXPERIENCE_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "veteran", label: "Veteran" },
];

export default function EditProfileModal({ profile, onClose, onSaved }) {
  const [form, setForm] = useState({
    displayName: profile.displayName || "",
    realName: profile.realName || "",
    age: profile.age || "",
    country: profile.country || "",
    experienceLevel: profile.experienceLevel || "",
    bio: profile.bio || "",
    favoriteGameModes: (profile.favoriteGameModes || []).join(", "),
    favoriteActivities: (profile.favoriteActivities || []).join(", "),
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl || null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  /* ── Close on ESC ── */
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      let avatarUrl = profile.avatarUrl ?? undefined;

      /* Upload new avatar if selected */
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!uploadRes.ok) {
          const up = await uploadRes.json();
          throw new Error(up.message || "Avatar upload failed");
        }
        const upData = await uploadRes.json();
        avatarUrl = upData.imageUrl;
      }

      /* Parse comma-separated tags */
      const parseList = (str) =>
        str
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

      const body = {
        displayName: form.displayName.trim(),
        realName: form.realName.trim(),
        age: form.age !== "" ? Number(form.age) : null,
        country: form.country.trim(),
        experienceLevel: form.experienceLevel,
        bio: form.bio.trim(),
        favoriteGameModes: parseList(form.favoriteGameModes),
        favoriteActivities: parseList(form.favoriteActivities),
        avatarUrl: avatarUrl ?? "",
      };

      console.log("[EditProfileModal] submitting body:", JSON.stringify(body));

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      onSaved(data.profile);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    backgroundColor: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(218,165,32,0.18)",
    color: "rgba(255,224,176,0.92)",
    borderRadius: "0.5rem",
  };

  const focusRing =
    "focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-500/40";

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{
          backgroundColor: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(4px)",
        }}
      >
        {/* Card */}
        <motion.div
          className="w-full max-w-lg rounded-2xl overflow-hidden my-8"
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            backgroundColor: "rgba(12,8,2,0.95)",
            border: "1px solid rgba(218,165,32,0.2)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,200,100,0.04), inset 0 1px 0 rgba(255,200,100,0.06)",
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
                color: "rgba(255,224,176,0.95)",
                textShadow: "0 0 20px rgba(218,165,32,0.3)",
              }}
            >
              Edit Profile
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md text-sm transition-all"
              style={{ color: "rgba(255,224,176,0.5)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(255,224,176,0.9)";
                e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.06)";
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
          <form
            onSubmit={handleSubmit}
            className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto"
          >
            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{
                  backgroundColor: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#fca5a5",
                }}
              >
                {error}
              </div>
            )}

            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center transition-all hover:opacity-80"
                style={{
                  border: "3px solid rgba(218,165,32,0.35)",
                  backgroundColor: "rgba(0,0,0,0.4)",
                  boxShadow: "0 0 14px rgba(218,165,32,0.12)",
                }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className="text-xs text-center leading-tight"
                    style={{ color: "rgba(255,224,176,0.4)" }}
                  >
                    Upload
                    <br />
                    Avatar
                  </span>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p
                className="text-[10px] mt-1.5"
                style={{ color: "rgba(255,224,176,0.3)" }}
              >
                Click to change avatar
              </p>
            </div>

