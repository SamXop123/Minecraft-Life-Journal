"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

/* Keyframes injected via <style> tag to avoid Tailwind v4 CSS parsing issues */
const mcKeyframes = `
  @keyframes mc-ken-burns {
    0% { transform: scale(1); }
    50% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  @keyframes mc-petal-fall {
    0% { transform: translateY(-20px) rotate(0deg) translateX(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 0.8; }
    100% { transform: translateY(100vh) rotate(720deg) translateX(80px); opacity: 0; }
  }
  @keyframes mc-glow-pulse {
    0%, 100% { box-shadow: 0 0 8px var(--mc-glow), 0 0 20px var(--mc-glow); }
    50% { box-shadow: 0 0 16px var(--mc-glow), 0 0 40px var(--mc-glow), 0 0 60px var(--mc-glow); }
  }
  @keyframes mc-title-flicker {
    0%, 100% { text-shadow: 0 0 10px var(--mc-glow), 0 0 20px var(--mc-glow), 2px 2px 0 #000; }
    50% { text-shadow: 0 0 20px var(--mc-glow), 0 0 40px var(--mc-glow), 0 0 60px var(--mc-glow), 2px 2px 0 #000; }
  }
  @keyframes mc-border-march {
    0% { background-position: 0 0; }
    100% { background-position: 40px 0; }
  }
`;

/* ── cherry petal particles for register page ── */
function CherryPetals() {
  const petals = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 4 + Math.random() * 6,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[1]">
      {petals.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: 0,
            left: p.left,
            width: p.size,
            height: p.size,
            background: `hsl(${330 + Math.random() * 20}, 80%, ${70 + Math.random() * 15}%)`,
            borderRadius: "50% 0 50% 50%",
            animation: `mc-petal-fall ${p.duration}s ${p.delay}s linear infinite`,
            imageRendering: "pixelated",
          }}
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: mcKeyframes }} />
      <div className="relative min-h-screen flex overflow-hidden bg-[#1a1a2e]">
        {/* ── LEFT: Cherry Blossom Image Panel ── */}
        <div
          className="hidden lg:block relative w-[55%] overflow-hidden"
          style={{ clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)" }}
        >
          {/* Ken-burns animated bg image */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/cherry.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              animation: "mc-ken-burns 25s ease-in-out infinite",
            }}
          />

          {/* pink gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(168,40,122,0.3) 50%, rgba(26,26,46,0.7) 100%)",
            }}
          />

          {/* bottom vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(26,26,46,0.95) 0%, transparent 40%)",
            }}
          />

          {/* Centered branding text on image side */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-12">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl font-bold text-pink-300 mb-4 text-center"
              style={{
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "1.5rem",
                lineHeight: "2.2rem",
                textShadow:
                  "3px 3px 0 #000, 0 0 20px rgba(236,72,153,0.6)",
                imageRendering: "pixelated",
              }}
            >
              MINECRAFT
              <br />
              LIFE JOURNAL
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-pink-200/70 text-center max-w-xs"
              style={{ fontFamily: "'Silkscreen', cursive", fontSize: "0.8rem" }}
            >
              A new chapter blossoms today...
            </motion.p>
          </div>
        </div>

        {/* ── SLANTED GLOW LINE (follows the clip-path diagonal) ── */}
        <div
          className="hidden lg:block absolute z-20 top-0 bottom-0 pointer-events-none"
          style={{ left: "0", width: "100%" }}
        >
          <svg
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            {/* Glow line along the slant: from 55% top to ~47% bottom (matching clip-path 100%→85%) */}
            <line
              x1="550" y1="0" x2="467" y2="1000"
              stroke="#EC4899"
              strokeWidth="1.5"
              opacity="0.5"
            />
            <line
              x1="550" y1="0" x2="467" y2="1000"
              stroke="#EC4899"
              strokeWidth="5"
              opacity="0.08"
            />
          </svg>
        </div>

        {/* ── RIGHT: Register Form Panel ── */}
        <div className="relative flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
          {/* Cherry petal particles */}
          <CherryPetals />

          {/* Pixelated grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
              imageRendering: "pixelated",
            }}
          />

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md"
          >
            {/* Minecraft-style card */}
            <div
              className="relative rounded-sm p-8 md:p-10"
              style={{
                background:
                  "linear-gradient(145deg, rgba(50,30,45,0.95) 0%, rgba(30,20,28,0.98) 100%)",
                border: "3px solid rgba(236,72,153,0.3)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 40px rgba(236,72,153,0.08), 0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              {/* Animated border (marching ants style) */}
              <div
                className="absolute inset-0 rounded-sm pointer-events-none"
                style={{
                  border: "2px dashed rgba(236,72,153,0.15)",
                  margin: "6px",
                  animation: "mc-border-march 2s linear infinite",
                }}
              />

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-2"
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "0.85rem",
                  color: "#EC4899",
                  "--mc-glow": "rgba(236,72,153,0.5)",
                  animation: "mc-title-flicker 3s ease-in-out infinite",
                  lineHeight: "1.6rem",
                }}
              >
                Join the Adventure
              </motion.h1>
              <p
                className="text-center mb-7 text-pink-200/40"
                style={{
                  fontFamily: "'Silkscreen', cursive",
                  fontSize: "0.7rem",
                }}
              >
                🌸 New Explorer 🌸
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-5 p-3 rounded-sm text-center text-sm"
                  style={{
                    background: "rgba(239,68,68,0.12)",
                    border: "2px solid rgba(239,68,68,0.3)",
                    color: "#FCA5A5",
                    fontFamily: "'Silkscreen', cursive",
                    fontSize: "0.7rem",
                  }}
                >
                  ✖ {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block mb-1.5"
                    style={{
                      fontFamily: "'Silkscreen', cursive",
                      fontSize: "0.7rem",
                      color: "#D4A0BA",
                    }}
                  >
                    👤 Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={form.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-sm text-white placeholder-pink-900/60 focus:outline-none transition-all duration-200"
                    style={{
                      background: "rgba(20,10,18,0.8)",
                      border: "2px solid rgba(236,72,153,0.2)",
                      fontFamily: "'VT323', monospace",
                      fontSize: "1.15rem",
                      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(236,72,153,0.6)";
                      e.target.style.boxShadow =
                        "inset 0 2px 8px rgba(0,0,0,0.4), 0 0 15px rgba(236,72,153,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(236,72,153,0.2)";
                      e.target.style.boxShadow =
                        "inset 0 2px 8px rgba(0,0,0,0.4)";
                    }}
                    placeholder="Steve"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block mb-1.5"
                    style={{
                      fontFamily: "'Silkscreen', cursive",
                      fontSize: "0.7rem",
                      color: "#D4A0BA",
                    }}
                  >
                    📧 Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-sm text-white placeholder-pink-900/60 focus:outline-none transition-all duration-200"
                    style={{
                      background: "rgba(20,10,18,0.8)",
                      border: "2px solid rgba(236,72,153,0.2)",
                      fontFamily: "'VT323', monospace",
                      fontSize: "1.15rem",
                      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(236,72,153,0.6)";
                      e.target.style.boxShadow =
                        "inset 0 2px 8px rgba(0,0,0,0.4), 0 0 15px rgba(236,72,153,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(236,72,153,0.2)";
                      e.target.style.boxShadow =
                        "inset 0 2px 8px rgba(0,0,0,0.4)";
                    }}
                    placeholder="steve@minecraft.net"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block mb-1.5"
                    style={{
                      fontFamily: "'Silkscreen', cursive",
                      fontSize: "0.7rem",
                      color: "#D4A0BA",
                    }}
                  >
                    🔑 Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-sm text-white placeholder-pink-900/60 focus:outline-none transition-all duration-200"
                    style={{
                      background: "rgba(20,10,18,0.8)",
                      border: "2px solid rgba(236,72,153,0.2)",
                      fontFamily: "'VT323', monospace",
                      fontSize: "1.15rem",
                      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(236,72,153,0.6)";
                      e.target.style.boxShadow =
                        "inset 0 2px 8px rgba(0,0,0,0.4), 0 0 15px rgba(236,72,153,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(236,72,153,0.2)";
                      e.target.style.boxShadow =
                        "inset 0 2px 8px rgba(0,0,0,0.4)";
                    }}
                    placeholder="At least 6 characters"
                  />
                </div>

                {/* Pink-glow submit button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                  style={{
                    "--mc-glow": "rgba(236,72,153,0.5)",
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "0.65rem",
                    background:
                      "linear-gradient(180deg, #EC4899 0%, #BE185D 100%)",
                    border: "2px solid rgba(236,72,153,0.4)",
                    animation: "mc-glow-pulse 2.5s ease-in-out infinite",
                    textShadow: "1px 1px 0 rgba(0,0,0,0.5)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {loading ? "⏳ Creating..." : "🌸 Register"}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-6 gap-3">
                <div className="flex-1 h-px bg-pink-900/30" />
                <span
                  style={{
                    fontFamily: "'Silkscreen', cursive",
                    fontSize: "0.6rem",
                    color: "rgba(236,72,153,0.3)",
                  }}
                >
                  ◆ ◆ ◆
                </span>
                <div className="flex-1 h-px bg-pink-900/30" />
              </div>

              <p className="text-center">
                <span
                  style={{
                    fontFamily: "'Silkscreen', cursive",
                    fontSize: "0.65rem",
                    color: "rgba(236,72,153,0.4)",
                  }}
                >
                  Already exploring?{" "}
                </span>
                <Link
                  href="/login"
                  className="hover:underline transition-colors"
                  style={{
                    fontFamily: "'Silkscreen', cursive",
                    fontSize: "0.65rem",
                    color: "#10B981",
                  }}
                >
                  Sign In →
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
