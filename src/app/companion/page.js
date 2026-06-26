"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PixelParticles from "@/components/PixelParticles";
import {
  Key,
  Copy,
  Check,
  ShieldAlert,
  Wifi,
  Info,
  ChevronLeft,
  Download,
  Terminal,
  FileCode,
  BookOpen,
} from "lucide-react";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CompanionPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Companion Integration State
  const [rawApiKey, setRawApiKey] = useState("");
  const [submittingKey, setSubmittingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

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

  async function handleGenerateApiKey() {
    setSubmittingKey(true);
    let token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await fetch("/api/profile/apikey", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (res.ok) {
        setRawApiKey(data.apiKey);
        await fetchProfile();
      } else {
        alert(data.message || "Failed to generate API Key");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSubmittingKey(false);
    }
  }

  async function handleRevokeApiKey() {
    if (
      !confirm(
        "Are you sure you want to revoke this API Key? The companion app will stop working immediately."
      )
    ) {
      return;
    }

    setSubmittingKey(true);
    let token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await fetch("/api/profile/apikey", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setRawApiKey("");
        await fetchProfile();
        alert("API Key revoked successfully.");
      } else {
        alert(data.message || "Failed to revoke API Key");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSubmittingKey(false);
    }
  }

  function handleCopyKey() {
    if (!rawApiKey) return;
    navigator.clipboard.writeText(rawApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0c0703" }}
      >
        <motion.div
          className="flex flex-col items-center gap-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-amber-200/60 text-sm font-medium tracking-widest uppercase">
            Loading Companion Info...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-100 bg-[#0c0703]">
      {/* Background Hero */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center center", zIndex: 0 }}
      >
        <img
          src="/minecraft-hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay"
          draggable={false}
        />
      </motion.div>

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse at top, rgba(15,10,3,0.7) 0%, rgba(8,4,1,0.95) 100%)",
        }}
      />

      <div className="fixed inset-0 pointer-events-none opacity-40" style={{ zIndex: 2 }}>
        <PixelParticles count={20} />
      </div>

      <div className="relative px-4 py-12 md:py-20 min-h-screen" style={{ zIndex: 10 }}>
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          {/* Back to Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-between items-center mb-2"
          >
            <Link
              href="/dashboard"
              className="flex items-center gap-2 group text-amber-200/50 hover:text-amber-200 transition-colors text-sm font-medium bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Return to Dashboard
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Stats & Setup Downloads */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Connection Status & Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-2xl rounded-3xl p-6 flex flex-col relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(20,15,10,0.75) 0%, rgba(10,5,2,0.85) 100%)",
                  border: "1px solid rgba(255,200,100,0.08)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <h3 className="text-sm font-bold uppercase tracking-widest text-amber-200/40 mb-4 flex items-center gap-2">
                  <Wifi size={16} className="text-purple-400" />
                  Connection Status
                </h3>

                {profile?.apiKeyHash ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-sm text-green-400 font-semibold uppercase tracking-wider">
                        Active Link
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/5 space-y-1.5 text-xs font-light text-amber-200/50">
                      <p>
                        Last Sync:{" "}
                        <span className="text-amber-100/70 font-mono">
                          {profile.apiKeyLastUsedAt
                            ? `${formatDate(profile.apiKeyLastUsedAt)} at ${new Date(
                                profile.apiKeyLastUsedAt
                              ).toLocaleTimeString()}`
                            : "Never"}
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500/40" />
                    <p className="text-sm text-amber-200/40 font-semibold uppercase tracking-wider">
                      Not Linked
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Direct Setup Download */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="backdrop-blur-2xl rounded-3xl p-6 flex flex-col relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(20,15,10,0.75) 0%, rgba(10,5,2,0.85) 100%)",
                  border: "1px solid rgba(255,200,100,0.08)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <h3 className="text-sm font-bold uppercase tracking-widest text-amber-200/40 mb-4 flex items-center gap-2">
                  <Download size={16} className="text-green-400" />
                  Client Downloads
                </h3>

                <p className="text-xs text-amber-100/60 leading-relaxed font-light mb-5">
                  Download and install the **MLJ Companion App** on your PC to start logging. Compatible with Windows.
                </p>

                <a
                  href="/MLJ-Companion-setup.exe"
                  download
                  className="w-full py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden text-sm uppercase tracking-wider text-center"
                  style={{
                    backgroundColor: "#1b7a43",
                    color: "#ffffff",
                    borderTop: "2px solid #34c759",
                    borderLeft: "2px solid #34c759",
                    borderBottom: "2px solid #0f4c27",
                    borderRight: "2px solid #0f4c27",
                    boxShadow: "0 4px 0 #0c361c, 0 6px 12px rgba(0,0,0,0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#22c55e";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#1b7a43";
                  }}
                >
                  <Download size={16} />
                  Download installer
                </a>
              </motion.div>
            </div>

            {/* Right Column: Key Config & Setup Guide */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* API Key management */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="backdrop-blur-xl rounded-3xl p-6 md:p-8 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(15,10,5,0.7) 0%, rgba(5,2,0,0.9) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderLeft: "4px solid rgba(139,92,246,0.45)",
                }}
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-amber-200/40 mb-4 flex items-center gap-2">
                  <Key size={18} className="text-purple-400" />
                  API Key Manager
                </h3>

                <div className="space-y-6">
                  <p className="text-sm text-amber-100/70 leading-relaxed font-light">
                    Generate an API Authentication key below to connect the companion app. Paste this key into the desktop client setup panel.
                  </p>

                  <div
                    className="p-5 rounded-xl backdrop-blur-md"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(255,200,100,0.05)",
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-amber-200/30 uppercase tracking-[0.2em] mb-1">
                          API Authentication Key
                        </p>
                        {profile?.apiKeyHash ? (
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-xs text-green-400 font-medium">
                              Active (Hashed in Database)
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                            <p className="text-xs text-amber-200/40 font-medium">
                              No Key Generated
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {profile?.apiKeyHash ? (
                          <button
                            onClick={handleRevokeApiKey}
                            disabled={submittingKey}
                            className="px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-950/40 cursor-pointer disabled:opacity-50"
                          >
                            Revoke Key
                          </button>
                        ) : null}

                        <button
                          onClick={handleGenerateApiKey}
                          disabled={submittingKey}
                          className="px-4 py-2.5 text-xs font-semibold rounded-lg transition-all text-purple-200 bg-purple-900/30 border border-purple-500/30 hover:bg-purple-900/50 hover:border-purple-400 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {profile?.apiKeyHash ? "Regenerate Key" : "Generate API Key"}
                        </button>
                      </div>
                    </div>

                    {/* Show Raw Key */}
                    {rawApiKey && (
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 font-mono text-sm px-3 py-2.5 rounded-lg bg-black/60 border border-purple-500/30 text-purple-300 select-all overflow-x-auto whitespace-nowrap scrollbar-thin">
                            {rawApiKey}
                          </div>
                          <button
                            onClick={handleCopyKey}
                            className="p-2.5 rounded-lg border bg-white/5 hover:bg-white/10 transition-colors text-amber-100 flex items-center justify-center shrink-0 cursor-pointer"
                            style={{ borderColor: "rgba(255,255,255,0.08)" }}
                            title="Copy Key to Clipboard"
                          >
                            {copiedKey ? (
                              <Check size={16} className="text-green-400" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                        <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-lg flex gap-3 text-amber-200 text-xs">
                          <ShieldAlert size={18} className="shrink-0 text-amber-400" />
                          <p className="leading-relaxed font-light">
                            <strong>Warning:</strong> Copy this API Key now! For security reasons,
                            it will never be displayed again. If you lose it, you will need to
                            regenerate a new one.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Step-by-Step Setup Guide */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="backdrop-blur-xl rounded-3xl p-6 md:p-8 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(15,10,5,0.7) 0%, rgba(5,2,0,0.9) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderLeft: "4px solid rgba(218,165,32,0.45)",
                }}
              >
                <h3 className="text-sm font-bold uppercase tracking-widest text-amber-200/40 mb-5 flex items-center gap-2">
                  <Info size={18} className="text-amber-500/50" />
                  Quest Log: Setup Instructions
                </h3>

                <div className="space-y-4 text-sm text-amber-100/60 leading-relaxed font-light">
                  <div className="flex gap-4 items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-amber-600 border border-amber-400 text-white font-bold shrink-0 text-xs shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                      1
                    </div>
                    <div className="pt-0.5">
                      <h4 className="font-bold text-amber-100 text-sm mb-0.5">Download & Install</h4>
                      <p>
                        Download the companion installer using the button on the left panel, and
                        run the installation setup.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-amber-600 border border-amber-400 text-white font-bold shrink-0 text-xs shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                      2
                    </div>
                    <div className="pt-0.5">
                      <h4 className="font-bold text-amber-100 text-sm mb-0.5">Link Your Account</h4>
                      <p>
                        Generate your unique **API Key** above, copy it, and paste it into the Connect
                        box in the Companion App interface.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-amber-600 border border-amber-400 text-white font-bold shrink-0 text-xs shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                      3
                    </div>
                    <div className="pt-0.5">
                      <h4 className="font-bold text-amber-100 text-sm mb-0.5">Start Monitoring</h4>
                      <p>
                        Select your active world from the dropdown menu, click **Start Monitoring**,
                        and play Minecraft!
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-amber-600 border border-amber-400 text-white font-bold shrink-0 text-xs shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                      4
                    </div>
                    <div className="pt-0.5">
                      <h4 className="font-bold text-amber-100 text-sm mb-0.5">In-Game Commands</h4>
                      <p>
                        While playing, type custom keywords in the Minecraft chat to log milestones instantly:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                        <li>
                          <code>#journal &lt;message&gt;</code> — Logs a new timeline memory (e.g.{" "}
                          <code>#journal Defeated the Witch!</code>)
                        </li>
                        <li>
                          <code>#coords &lt;label&gt; &lt;X&gt; &lt;Y&gt; &lt;Z&gt;</code> — Registers
                          a coordinate marker (e.g. <code>#coords Base Portal 100 64 -200</code>)
                        </li>
                        <li>
                          **Screenshots**: Taking a screenshot in-game automatically pairs it to
                          timeline journals written within 60 seconds.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
