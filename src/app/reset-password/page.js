"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const pageStyles = {
  background:
    "radial-gradient(circle at top, rgba(16,185,129,0.16), transparent 35%), linear-gradient(180deg, #111827 0%, #0f172a 100%)",
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function validateToken() {
      if (!token) {
        setError("This reset link is missing its token.");
        setCheckingToken(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/auth/reset-password?token=${encodeURIComponent(token)}`
        );
        const data = await response.json();

        if (ignore) {
          return;
        }

        if (!response.ok) {
          setError(data.message || "This reset link is invalid or has expired.");
          setTokenValid(false);
        } else {
          setTokenValid(true);
          setError("");
        }
      } catch {
        if (!ignore) {
          setError("Could not validate the reset link. Please try again.");
          setTokenValid(false);
        }
      } finally {
        if (!ignore) {
          setCheckingToken(false);
        }
      }
    }

    validateToken();

    return () => {
      ignore = true;
    };
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not reset password.");
        return;
      }

      setNotice("Password reset successfully. Redirecting to login...");
      setTokenValid(false);
      setTimeout(() => {
        router.push("/login");
      }, 1800);
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
          className="grid w-full overflow-hidden rounded-sm border border-emerald-400/20 bg-black/30 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-md lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="hidden border-r border-emerald-400/15 bg-[linear-gradient(180deg,rgba(16,185,129,0.12),transparent)] p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <p
                className="mb-4 text-[0.72rem] uppercase tracking-[0.35em] text-emerald-200/60"
                style={{ fontFamily: "'Silkscreen', cursive" }}
              >
                Secure Return
              </p>
              <h1
                className="max-w-sm text-3xl leading-tight text-emerald-100"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                Claim a New Password
              </h1>
            </div>

            <div className="space-y-4 text-emerald-100/70">
              <p style={{ fontFamily: "'VT323', monospace", fontSize: "1.35rem" }}>
                Choose a new password strong enough to protect your world
                stories and shared memories.
              </p>
              <p style={{ fontFamily: "'VT323', monospace", fontSize: "1.15rem" }}>
                This reset link only works for a short time, so once you are in,
                the old trail closes behind you.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-md">
              <p
                className="mb-3 text-center text-[0.72rem] uppercase tracking-[0.25em] text-emerald-200/65 lg:text-left"
                style={{ fontFamily: "'Silkscreen', cursive" }}
              >
                Password Reset
              </p>
              <h2
                className="text-center text-2xl leading-tight text-emerald-100 lg:text-left"
                style={{ fontFamily: "'Press Start 2P', cursive", lineHeight: "1.6" }}
              >
                Set New Password
              </h2>
              <p
                className="mt-4 text-center text-emerald-100/65 lg:text-left"
                style={{ fontFamily: "'VT323', monospace", fontSize: "1.2rem" }}
              >
                Create a fresh password and step back into the journal.
              </p>

              {checkingToken && (
                <div className="mt-6 rounded-sm border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100/80">
                  Validating reset link...
                </div>
              )}

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

              {tokenValid && !checkingToken && (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-[0.72rem] text-emerald-200/80"
                      style={{ fontFamily: "'Silkscreen', cursive" }}
                    >
                      New Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-sm border border-emerald-400/20 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50"
                      style={{ fontFamily: "'VT323', monospace", fontSize: "1.25rem" }}
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-[0.72rem] text-emerald-200/80"
                      style={{ fontFamily: "'Silkscreen', cursive" }}
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full rounded-sm border border-emerald-400/20 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50"
                      style={{ fontFamily: "'VT323', monospace", fontSize: "1.25rem" }}
                      placeholder="Re-enter your password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-sm border border-emerald-300/25 bg-gradient-to-b from-emerald-400 to-emerald-600 px-4 py-3 font-bold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "0.72rem" }}
                  >
                    {loading ? "Resetting..." : "Update Password"}
                  </button>
                </form>
              )}

              <div className="mt-8 flex items-center gap-3 text-emerald-100/40">
                <div className="h-px flex-1 bg-emerald-200/15" />
                <span style={{ fontFamily: "'Silkscreen', cursive", fontSize: "0.6rem" }}>
                  LOGIN
                </span>
                <div className="h-px flex-1 bg-emerald-200/15" />
              </div>

              <p
                className="mt-6 text-center text-emerald-100/65 lg:text-left"
                style={{ fontFamily: "'VT323', monospace", fontSize: "1.15rem" }}
              >
                Want to head back now?{" "}
                <Link href="/login" className="text-emerald-300 hover:underline">
                  Return to login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
