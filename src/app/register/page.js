"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

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

function CherryPetals() {
  const [petals] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 4 + Math.random() * 6,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      color: `hsl(${330 + Math.random() * 20}, 80%, ${70 + Math.random() * 15}%)`,
    }))
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[1]">
      {petals.map((petal) => (
        <div
          key={petal.id}
          style={{
            position: "absolute",
            top: 0,
            left: petal.left,
            width: petal.size,
            height: petal.size,
            background: petal.color,
            borderRadius: "50% 0 50% 50%",
            animation: `mc-petal-fall ${petal.duration}s ${petal.delay}s linear infinite`,
            imageRendering: "pixelated",
          }}
        />
      ))}
    </div>
  );
}

const fieldLabelStyle = {
  fontFamily: "'Silkscreen', cursive",
  fontSize: "0.7rem",
  color: "#D4A0BA",
};

const fieldInputStyle = {
  background: "rgba(20,10,18,0.8)",
  border: "2px solid rgba(236,72,153,0.2)",
  fontFamily: "'VT323', monospace",
  fontSize: "1.15rem",
  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4)",
};

function setInputFocusStyles(element, active) {
  element.style.borderColor = active
    ? "rgba(236,72,153,0.6)"
    : "rgba(236,72,153,0.2)";
  element.style.boxShadow = active
    ? "inset 0 2px 8px rgba(0,0,0,0.4), 0 0 15px rgba(236,72,153,0.15)"
    : "inset 0 2px 8px rgba(0,0,0,0.4)";
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    function checkZoom() {
      const ratio = window.outerWidth / window.innerWidth;
      setCompact(ratio >= 0.99);
    }

    checkZoom();
    window.addEventListener("resize", checkZoom);
    return () => window.removeEventListener("resize", checkZoom);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setResendCooldown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function activateVerificationStep(email, message, retryAfterSeconds = 60) {
    setShowVerification(true);
    setVerificationEmail(email || form.email);
    setVerificationCode("");
    setNotice(message || "Verification code sent to your email.");
    setError("");
    setResendCooldown(retryAfterSeconds);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.requiresVerification) {
        activateVerificationStep(
          data.email,
          data.message,
          data.retryAfterSeconds ?? 60
        );
      }

      if (!response.ok) {
        if (!data.requiresVerification) {
          setError(data.message || "Registration failed");
        }
        return;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifySubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setVerificationLoading(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verificationEmail || form.email,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Verification failed");
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setVerificationLoading(false);
    }
  }

  async function handleResendCode() {
    setError("");
    setNotice("");
    setResendLoading(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail || form.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not resend verification code");
        if (data.retryAfterSeconds) {
          setResendCooldown(data.retryAfterSeconds);
        }
        return;
      }

      setNotice(data.message || "A new verification code has been sent.");
      setResendCooldown(60);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: mcKeyframes }} />
      <div className="relative h-screen flex overflow-hidden bg-[#1a1a2e]">
        <div
          className="hidden lg:block relative w-[55%] overflow-hidden"
          style={{ clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)" }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/cherry.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              animation: "mc-ken-burns 25s ease-in-out infinite",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(168,40,122,0.3) 50%, rgba(26,26,46,0.7) 100%)",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(26,26,46,0.95) 0%, transparent 40%)",
            }}
          />

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
                textShadow: "3px 3px 0 #000, 0 0 20px rgba(236,72,153,0.6)",
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

        <div
          className="hidden lg:block absolute z-20 top-0 bottom-0 pointer-events-none"
          style={{ left: "0", width: "100%" }}
        >
          <svg
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <line
              x1="550"
              y1="0"
              x2="467"
              y2="1000"
              stroke="#EC4899"
              strokeWidth="1.5"
              opacity="0.5"
            />
            <line
              x1="550"
              y1="0"
              x2="467"
              y2="1000"
              stroke="#EC4899"
              strokeWidth="5"
              opacity="0.08"
            />
          </svg>
        </div>

        <div className={`relative flex-1 flex flex-col px-6 ${compact ? "py-6" : "py-12"} lg:px-16 overflow-y-auto`}>
          <CherryPetals />

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
            className="relative z-10 w-full max-w-md mx-auto my-auto"
          >
            <div
              className={`relative rounded-sm ${compact ? "p-6" : "p-8"}`}
              style={{
                background:
                  "linear-gradient(145deg, rgba(50,30,45,0.95) 0%, rgba(30,20,28,0.98) 100%)",
                border: "3px solid rgba(236,72,153,0.3)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 40px rgba(236,72,153,0.08), 0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="absolute inset-0 rounded-sm pointer-events-none"
                style={{
                  border: "2px dashed rgba(236,72,153,0.15)",
                  margin: "6px",
                  animation: "mc-border-march 2s linear infinite",
                }}
              />

              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-center ${compact ? "mb-1" : "mb-2"}`}
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "0.85rem",
                  color: "#EC4899",
                  "--mc-glow": "rgba(236,72,153,0.5)",
                  animation: "mc-title-flicker 3s ease-in-out infinite",
                  lineHeight: "1.6rem",
                }}
              >
                {showVerification ? "Check Your Mail" : "Join the Adventure"}
              </motion.h1>
              <p
                className={`text-center ${compact ? "mb-3" : "mb-7"} text-pink-200/40`}
                style={{
                  fontFamily: "'Silkscreen', cursive",
                  fontSize: "0.7rem",
                }}
              >
                {showVerification ? "Verify your inbox to enter" : "Create your account"}
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
                  x {error}
                </motion.div>
              )}

              {notice && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-5 p-3 rounded-sm text-center text-sm"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    border: "2px solid rgba(16,185,129,0.3)",
                    color: "#A7F3D0",
                    fontFamily: "'Silkscreen', cursive",
                    fontSize: "0.7rem",
                  }}
                >
                  OK {notice}
                </motion.div>
              )}

              {showVerification ? (
                <>
                  <div
                    className={`mb-5 rounded-sm ${compact ? "p-4" : "p-5"}`}
                    style={{
                      background: "rgba(17,24,39,0.4)",
                      border: "2px solid rgba(236,72,153,0.22)",
                    }}
                  >
                    <p
                      className="mb-2 text-center"
                      style={{
                        fontFamily: "'Silkscreen', cursive",
                        fontSize: "0.68rem",
                        color: "#F9A8D4",
                      }}
                    >
                      Verification code sent to
                    </p>
                    <p
                      className="text-center break-all"
                      style={{
                        fontFamily: "'VT323', monospace",
                        fontSize: "1.2rem",
                        color: "#FFFFFF",
                      }}
                    >
                      {verificationEmail || form.email}
                    </p>
                    <p
                      className="mt-3 text-center"
                      style={{
                        fontFamily: "'Silkscreen', cursive",
                        fontSize: "0.6rem",
                        color: "rgba(249,168,212,0.65)",
                        lineHeight: "1.2rem",
                      }}
                    >
                      Enter the 6-digit OTP from your inbox.
                      <br />
                      Check spam too if it does not appear.
                    </p>
                  </div>

                  <form onSubmit={handleVerifySubmit} className={compact ? "space-y-3" : "space-y-4"}>
                    <div>
                      <label htmlFor="verificationCode" className="block mb-1.5" style={fieldLabelStyle}>
                        6-Digit Code
                      </label>
                      <input
                        id="verificationCode"
                        name="verificationCode"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        required
                        value={verificationCode}
                        onChange={(event) =>
                          setVerificationCode(
                            event.target.value.replace(/\D/g, "").slice(0, 6)
                          )
                        }
                        className="w-full px-4 py-3 rounded-sm text-center tracking-[0.5em] text-white placeholder-pink-900/60 focus:outline-none transition-all duration-200"
                        style={{ ...fieldInputStyle, fontSize: "1.4rem" }}
                        onFocus={(event) => setInputFocusStyles(event.target, true)}
                        onBlur={(event) => setInputFocusStyles(event.target, false)}
                        placeholder="123456"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={verificationLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 rounded-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                      style={{
                        "--mc-glow": "rgba(16,185,129,0.5)",
                        fontFamily: "'Press Start 2P', cursive",
                        fontSize: "0.62rem",
                        background: "linear-gradient(180deg, #10B981 0%, #047857 100%)",
                        border: "2px solid rgba(16,185,129,0.4)",
                        animation: "mc-glow-pulse 2.5s ease-in-out infinite",
                        textShadow: "1px 1px 0 rgba(0,0,0,0.5)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {verificationLoading ? "Verifying..." : "Verify Email"}
                    </motion.button>
                  </form>

                  <div className={`flex items-center ${compact ? "my-3" : "my-5"} gap-3`}>
                    <div className="flex-1 h-px bg-pink-900/30" />
                    <span
                      style={{
                        fontFamily: "'Silkscreen', cursive",
                        fontSize: "0.6rem",
                        color: "rgba(236,72,153,0.3)",
                      }}
                    >
                      DIAMOND
                    </span>
                    <div className="flex-1 h-px bg-pink-900/30" />
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendLoading || resendCooldown > 0}
                      className="w-full py-3 rounded-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                      style={{
                        fontFamily: "'Press Start 2P', cursive",
                        fontSize: "0.55rem",
                        background:
                          "linear-gradient(180deg, rgba(236,72,153,0.24) 0%, rgba(190,24,93,0.28) 100%)",
                        border: "2px solid rgba(236,72,153,0.25)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {resendLoading
                        ? "Sending..."
                        : resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : "Resend Code"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowVerification(false);
                        setNotice("");
                        setError("");
                        setVerificationCode("");
                        setResendCooldown(0);
                      }}
                      className="w-full text-center transition-colors hover:underline"
                      style={{
                        fontFamily: "'Silkscreen', cursive",
                        fontSize: "0.62rem",
                        color: "rgba(249,168,212,0.7)",
                      }}
                    >
                      Change details
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className={compact ? "space-y-3" : "space-y-4"}>
                    <div>
                      <label htmlFor="username" className="block mb-1.5" style={fieldLabelStyle}>
                        Username
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        value={form.username}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-sm text-white placeholder-pink-900/60 focus:outline-none transition-all duration-200"
                        style={fieldInputStyle}
                        onFocus={(event) => setInputFocusStyles(event.target, true)}
                        onBlur={(event) => setInputFocusStyles(event.target, false)}
                        placeholder="Steve"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block mb-1.5" style={fieldLabelStyle}>
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-sm text-white placeholder-pink-900/60 focus:outline-none transition-all duration-200"
                        style={fieldInputStyle}
                        onFocus={(event) => setInputFocusStyles(event.target, true)}
                        onBlur={(event) => setInputFocusStyles(event.target, false)}
                        placeholder="steve@gmail.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block mb-1.5" style={fieldLabelStyle}>
                        Password
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
                        style={fieldInputStyle}
                        onFocus={(event) => setInputFocusStyles(event.target, true)}
                        onBlur={(event) => setInputFocusStyles(event.target, false)}
                        placeholder="At least 6 characters"
                      />
                    </div>

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
                        background: "linear-gradient(180deg, #EC4899 0%, #BE185D 100%)",
                        border: "2px solid rgba(236,72,153,0.4)",
                        animation: "mc-glow-pulse 2.5s ease-in-out infinite",
                        textShadow: "1px 1px 0 rgba(0,0,0,0.5)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {loading ? "Sending Code..." : "Register"}
                    </motion.button>
                  </form>

                  <div className={`flex items-center ${compact ? "my-3" : "my-6"} gap-3`}>
                    <div className="flex-1 h-px bg-pink-900/30" />
                    <span
                      style={{
                        fontFamily: "'Silkscreen', cursive",
                        fontSize: "0.6rem",
                        color: "rgba(236,72,153,0.3)",
                      }}
                    >
                      DIAMOND
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
                      Already exploring?{' '}
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
                      Sign In
                    </Link>
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
