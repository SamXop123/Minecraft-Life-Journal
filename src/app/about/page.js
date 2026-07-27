"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import PixelParticles from "@/components/PixelParticles";
import {
  Info,
  Sparkles,
  ShieldCheck,
  Heart,
  ChevronLeft,
  Download,
  BookOpen,
  Code2,
  Globe,
  Cpu,
  UserCheck,
  ExternalLink,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0c0703] text-amber-100 selection:bg-amber-500/30 selection:text-amber-100">
      {/* Background image & gradient overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <img
          src="/minecraft-hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(20,12,4,0.85) 0%, rgba(8,4,1,0.98) 100%)",
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none opacity-30" style={{ zIndex: 1 }}>
        <PixelParticles count={18} />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-20 flex flex-col gap-10" style={{ zIndex: 10 }}>
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group text-amber-200/60 hover:text-amber-200 text-sm font-medium bg-black/40 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md transition-all"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/docs"
              className="text-xs font-mono text-amber-200/50 hover:text-amber-200 px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-950/20 transition-all flex items-center gap-1"
            >
              <BookOpen size={14} />
              Docs
            </Link>
            <Link
              href="/companion"
              className="text-xs font-mono font-bold text-green-400 hover:text-green-300 px-3.5 py-1.5 rounded-lg border border-green-500/30 bg-green-950/30 transition-all flex items-center gap-1.5"
            >
              <Download size={14} />
              Download App
            </Link>
          </div>
        </div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-widest">
            <Info size={14} />
            About Minecraft Life Journal
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-amber-100 tracking-tight" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
            Preserving Your Survival Story
          </h1>
          <p className="text-sm sm:text-base text-amber-200/60 leading-relaxed font-light">
            Minecraft Life Journal (MLJ) is a dedicated timeline application and live companion built to preserve your Minecraft world history, milestones, and achievements.
          </p>
        </motion.div>

        {/* Story Section */}
        <section className="backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/5 bg-black/40 space-y-6">
          <div className="flex items-center gap-3 text-amber-400 font-bold text-lg">
            <Heart size={20} className="text-red-400" />
            <h2>The Mission Behind MLJ</h2>
          </div>
          <p className="text-sm text-amber-100/70 leading-relaxed font-light">
            Every Minecraft survival world holds months of hard work—legendary builds, unforgettable boss fights, hilarious deaths, and milestones shared with friends. But all too often, when a world save gets archived or deleted, those memories disappear forever.
          </p>
          <p className="text-sm text-amber-100/70 leading-relaxed font-light">
            <strong>Minecraft Life Journal</strong> was created to solve this problem. By combining a lightweight desktop companion app with an interactive web dashboard, MLJ records your timeline live as you play—turning your gameplay into a rich, permanent story journal.
          </p>
        </section>

        {/* Key Features Grid */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-amber-100 tracking-tight text-center">
            What Makes MLJ Unique
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="backdrop-blur-xl rounded-2xl p-6 border border-white/5 bg-black/40 space-y-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit">
                <Cpu size={20} />
              </div>
              <h3 className="text-base font-bold text-amber-200">Zero-Bloat Companion</h3>
              <p className="text-xs text-amber-100/60 leading-relaxed font-light">
                Built with Rust & Tauri v2 for 0% CPU overhead, System Tray background support, and single-instance safety.
              </p>
            </div>

            <div className="backdrop-blur-xl rounded-2xl p-6 border border-white/5 bg-black/40 space-y-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit">
                <Globe size={20} />
              </div>
              <h3 className="text-base font-bold text-amber-200">Shareable World Links</h3>
              <p className="text-xs text-amber-100/60 leading-relaxed font-light">
                Generate secure share links or public world showcases to let friends explore your timeline, builds, and coordinates.
              </p>
            </div>

            <div className="backdrop-blur-xl rounded-2xl p-6 border border-white/5 bg-black/40 space-y-3">
              <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 w-fit">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-base font-bold text-amber-200">Privacy & Control</h3>
              <p className="text-xs text-amber-100/60 leading-relaxed font-light">
                Your data is secure with secret API Key authentication and a 10-day soft delete Trash Bin for complete control.
              </p>
            </div>
          </div>
        </section>

        {/* Creator & Version Section */}
        <section className="backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/5 bg-black/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-amber-300 font-mono text-xs uppercase tracking-widest">
              <UserCheck size={16} />
              Creator & Publisher
            </div>
            <h3 className="text-xl font-bold text-amber-100">Developed by SamXop123</h3>
            <p className="text-xs text-amber-100/60 font-light max-w-md">
              Crafted with passion for the global Minecraft survival community.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold">
              VERSION 2.0.0 (RELEASE)
            </span>
            <a
              href="https://github.com/SamXop123"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 hover:underline text-[11px] flex items-center gap-1 transition-colors font-mono"
            >
              GitHub: @SamXop123 <ExternalLink size={12} />
            </a>
          </div>
        </section>

        {/* Footer Link */}
        <div className="pt-6 border-t border-white/5 text-center text-xs text-amber-200/40 font-mono">
          <span>Minecraft Life Journal &copy; 2026 &bull; SamXop123</span>
        </div>
      </div>
    </div>
  );
}
