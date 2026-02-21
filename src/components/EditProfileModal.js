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

