"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PixelParticles from "@/components/PixelParticles";

const CATEGORY_STYLES = {
  achievement: { bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.25)", color: "#facc15" },
  build: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", color: "#60a5fa" },
  death: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", color: "#f87171" },
  funny: { bg: "rgba(236,72,153,0.08)", border: "rgba(236,72,153,0.25)", color: "#f472b6" },
  emotional: { bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.25)", color: "#c084fc" },
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function SharedWorldPage({ params }) {
  const [world, setWorld] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSharedWorld() {
      try {
        const { token } = await params;
        const res = await fetch(`/api/share/${token}`);

        if (res.status === 404) {
          setError("This shared world does not exist or sharing has been disabled.");
          return;
        }

        if (!res.ok) throw new Error("Failed to load");

        const data = await res.json();
        setWorld(data.world);
        setMemories(data.memories || []);
      } catch {
        setError("Something went wrong loading this world.");
      } finally {
        setLoading(false);
      }
    }

    fetchSharedWorld();
  }, [params]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1a1008" }}>
        <motion.p
          className="text-amber-200/60 text-lg"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Loading shared world…
        </motion.p>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "#1a1008" }}>
        <p className="text-red-400 text-lg text-center max-w-md">{error}</p>
        <a href="/" className="text-sm underline" style={{ color: "rgba(255,224,176,0.5)" }}>
          Go Home
        </a>
      </div>
    );
  }

  if (!world) return null;

  return (
    <div className="relative min-h-screen">
      {/* Fixed Background */}
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

      {/* Dark overlay */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(8,4,1,0.8) 0%, rgba(12,7,2,0.55) 30%, rgba(10,6,2,0.5) 60%, rgba(8,4,1,0.85) 100%)",
        }}
      />

      {/* Warm glow */}
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

      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          background:
            "radial-gradient(ellipse 70% 65% at 50% 45%, transparent 30%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Particles */}
      <div className="fixed inset-0 pointer-events-none opacity-40" style={{ zIndex: 4 }}>
        <PixelParticles count={14} />
      </div>

      {/* Content */}
      <div className="relative px-4 py-10 min-h-screen" style={{ zIndex: 10 }}>
        <div className="max-w-3xl mx-auto">

          {/* Back Link */}
          <a
            href="/"
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
            ← Back Home
          </a>

          {/* Shared badge */}
          <motion.div
            className="flex items-center gap-2 mb-6"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "#6ee7b7",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Shared World
            </span>
          </motion.div>

          {/* World Header Card */}
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
                className="text-2xl font-bold"
                style={{
                  color: "rgba(255,224,176,0.95)",
                  textShadow:
                    "0 2px 16px rgba(0,0,0,0.8), 0 0 30px rgba(255,170,60,0.08)",
                }}
              >
                {world.name}
              </h1>
              {world.endedAt && (
                <span
                  className="px-2.5 py-1 rounded text-xs"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#f87171",
                  }}
                >
                  Ended
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <InfoItem label="Version" value={world.mcVersion} />
              <InfoItem label="Mode" value={world.mode} capitalize />
              <InfoItem label="Type" value={world.type} capitalize />
              {world.seed && <InfoItem label="Seed" value={world.seed} mono />}
              <InfoItem label="Started" value={formatDate(world.startedAt)} />
              {world.endedAt && <InfoItem label="Ended" value={formatDate(world.endedAt)} />}
            </div>

            {/* End details */}
            {world.endedAt && (world.endReason || world.finalMessage) && (
              <div
                className="mt-5 pt-5 space-y-3"
                style={{ borderTop: "1px solid rgba(218,165,32,0.12)" }}
              >
                {world.endReason && (
                  <div>
                    <p className="text-sm mb-1" style={{ color: "rgba(255,224,176,0.4)" }}>
                      End Reason
                    </p>
                    <p className="text-sm" style={{ color: "rgba(255,224,176,0.8)", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
                      {world.endReason}
                    </p>
                  </div>
                )}
                {world.finalMessage && (
                  <div>
                    <p className="text-sm mb-1" style={{ color: "rgba(255,224,176,0.4)" }}>
                      Final Message
                    </p>
                    <p className="text-sm italic" style={{ color: "rgba(255,224,176,0.8)", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
                      &ldquo;{world.finalMessage}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Memories */}
          <motion.div
            className="backdrop-blur-lg rounded-xl p-6"
            style={{
              backgroundColor: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(218,165,32,0.15)",
              boxShadow:
                "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,100,0.03)",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2
              className="text-xl font-semibold mb-6"
              style={{
                color: "rgba(255,224,176,0.95)",
                textShadow:
                  "0 0 15px rgba(218,165,32,0.4), 0 2px 6px rgba(0,0,0,0.7)",
              }}
            >
              Memories ({memories.length})
            </h2>

            {memories.length === 0 ? (
              <p className="text-center py-10" style={{ color: "rgba(255,224,176,0.35)" }}>
                No memories recorded yet.
              </p>
            ) : (
              <div className="space-y-4">
                {memories.map((memory, idx) => {
                  const cat = CATEGORY_STYLES[memory.category] || CATEGORY_STYLES.achievement;

                  return (
                    <motion.div
                      key={memory._id}
                      className="rounded-lg p-4"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(218,165,32,0.1)",
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: idx * 0.04 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className="font-semibold text-sm"
                            style={{
                              color: "rgba(255,224,176,0.9)",
                              textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                            }}
                          >
                            {memory.title}
                          </h3>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-medium capitalize"
                            style={{
                              backgroundColor: cat.bg,
                              border: `1px solid ${cat.border}`,
                              color: cat.color,
                            }}
                          >
                            {memory.category}
                          </span>
                        </div>
                        <span className="text-xs shrink-0 ml-2" style={{ color: "rgba(255,224,176,0.35)" }}>
                          {formatDate(memory.memoryDate)}
                        </span>
                      </div>

                      {memory.description && (
                        <p
                          className="text-sm mb-3 whitespace-pre-wrap"
                          style={{ color: "rgba(255,224,176,0.65)" }}
                        >
                          {memory.description}
                        </p>
                      )}

                      {memory.imageUrl && (
                        <div
                          className="rounded-lg overflow-hidden"
                          style={{
                            border: "1px solid rgba(218,165,32,0.1)",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                          }}
                        >
                          <img
                            src={memory.imageUrl}
                            alt={memory.title}
                            className="w-full max-h-72 object-cover"
                            draggable={false}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}

/* ── Small info display ── */
function InfoItem({ label, value, capitalize, mono }) {
  return (
    <div>
      <p className="mb-0.5" style={{ color: "rgba(255,224,176,0.4)" }}>{label}</p>
      <p
        className={`${capitalize ? "capitalize" : ""} ${mono ? "font-mono text-xs" : ""}`}
        style={{
          color: "rgba(255,224,176,0.8)",
          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
        }}
      >
        {value}
      </p>
    </div>
  );
}
