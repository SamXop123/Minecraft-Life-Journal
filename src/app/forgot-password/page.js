"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const pageStyles = {
  background:
    "radial-gradient(circle at top, rgba(245,158,11,0.15), transparent 35%), linear-gradient(180deg, #1a1a2e 0%, #111827 100%)",
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not send reset email.");
        return;
      }

      setNotice(
        data.message ||
          "If an account with that email exists, a password reset link has been sent."
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen px-6 py-10 text-white lg:px-12"
      style={pageStyles}
    >
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid w-full overflow-hidden rounded-sm border border-amber-400/20 bg-black/30 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-md lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="hidden border-r border-amber-400/15 bg-[linear-gradient(180deg,rgba(245,158,11,0.12),transparent)] p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <p
                className="mb-4 text-[0.72rem] uppercase tracking-[0.35em] text-amber-200/60"
                style={{ fontFamily: "'Silkscreen', cursive" }}
              >
                Recovery Quest
              </p>
              <h1
                className="max-w-sm text-3xl leading-tight text-amber-200"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                Find Your Way Back
              </h1>
            </div>

            <div className="space-y-4 text-amber-100/70">
              <p style={{ fontFamily: "'VT323', monospace", fontSize: "1.35rem" }}>
                Enter your account email and we will send you a secure password
                reset link.
              </p>
              <p style={{ fontFamily: "'VT323', monospace", fontSize: "1.15rem" }}>
                The link expires in 30 minutes, so you can get back to your
                world without leaving a long-lived recovery trail behind.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-md">
              <p
                className="mb-3 text-center text-[0.72rem] uppercase tracking-[0.25em] text-amber-200/65 lg:text-left"
                style={{ fontFamily: "'Silkscreen', cursive" }}
              >
                Password Reset
              </p>
              <h2
                className="text-center text-2xl leading-tight text-amber-100 lg:text-left"
                style={{ fontFamily: "'Press Start 2P', cursive", lineHeight: "1.6" }}
              >
                Send Reset Link
              </h2>
              <p
                className="mt-4 text-center text-amber-100/65 lg:text-left"
                style={{ fontFamily: "'VT323', monospace", fontSize: "1.2rem" }}
              >
                We will email you a link to choose a new password.
              </p>

              {error && (
                <div className="mt-6 rounded-sm border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {notice && (
                <div className="mt-6 rounded-sm border border-emerald-400/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {notice}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[0.72rem] text-amber-200/80"
                    style={{ fontFamily: "'Silkscreen', cursive" }}
                  >
                    Account Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-sm border border-amber-400/20 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-amber-300/50"
                    style={{ fontFamily: "'VT323', monospace", fontSize: "1.25rem" }}
                    placeholder="steve@gmail.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-sm border border-amber-300/25 bg-gradient-to-b from-amber-400 to-orange-500 px-4 py-3 font-bold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "0.72rem" }}
                >
                  {loading ? "Sending..." : "Email Reset Link"}
                </button>
              </form>

              <div className="mt-8 flex items-center gap-3 text-amber-100/40">
                <div className="h-px flex-1 bg-amber-200/15" />
                <span style={{ fontFamily: "'Silkscreen', cursive", fontSize: "0.6rem" }}>
                  RETURN
                </span>
                <div className="h-px flex-1 bg-amber-200/15" />
              </div>

              <p
                className="mt-6 text-center text-amber-100/65 lg:text-left"
                style={{ fontFamily: "'VT323', monospace", fontSize: "1.15rem" }}
              >
                Remembered it?{" "}
                <Link href="/login" className="text-emerald-300 hover:underline">
                  Go back to login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
