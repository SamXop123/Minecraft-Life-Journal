"use client";

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy, Check, Smartphone, Square } from "lucide-react";
import MinecraftCardIcon from "@/components/MinecraftCardIcon";

function formatPlaytime(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDaysSurvived(startDate) {
  if (!startDate) return 1;
  const diffTime = Math.abs(Date.now() - new Date(startDate).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

export default function MLJCardModal({
  isOpen,
  onClose,
  world,
  memories = [],
  coordinates = [],
}) {
  const [format, setFormat] = useState("story"); // "story" (9:16) or "square" (1:1)
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const canvasRef = useRef(null);

  const creatorName = useMemo(() => {
    if (!world) return "Adventurer";
    return (
      world.userId?.displayName ||
      world.userId?.username ||
      "Adventurer"
    );
  }, [world]);

  const daysSurvived = useMemo(() => {
    return getDaysSurvived(world?.startedAt);
  }, [world?.startedAt]);

  const playtimeText = useMemo(() => {
    return formatPlaytime(world?.playtimeMinutes);
  }, [world?.playtimeMinutes]);

  // Offscreen canvas high-resolution image generator
  async function generateCardCanvas(targetFormat) {
    const isStory = targetFormat === "story";
    const width = isStory ? 1080 : 1200;
    const height = isStory ? 1920 : 1200;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    // 1. Background leather / obsidian gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#0e0906");
    bgGrad.addColorStop(0.5, "#170f09");
    bgGrad.addColorStop(1, "#0a0705");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle star / particle texture
    ctx.fillStyle = "rgba(255, 218, 150, 0.04)";
    for (let i = 0; i < 90; i++) {
      const rx = (i * 137.5) % width;
      const ry = (i * 229.7) % height;
      ctx.fillRect(rx, ry, (i % 3) + 2, (i % 3) + 2);
    }

    // 2. Pixel Border Frame (Double Gold Borders + Corner Brackets)
    const margin = 40;
    ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
    ctx.lineWidth = 4;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.strokeRect(margin + 12, margin + 12, width - margin * 2 - 24, height - margin * 2 - 24);

    // Corner decorative brackets (Gold Pixels)
    const corners = [
      [margin + 12, margin + 12],
      [width - margin - 36, margin + 12],
      [margin + 12, height - margin - 36],
      [width - margin - 36, height - margin - 36],
    ];
    ctx.fillStyle = "#ffd896";
    corners.forEach(([cx, cy]) => {
      ctx.fillRect(cx, cy, 24, 24);
      ctx.fillStyle = "#b45309";
      ctx.fillRect(cx + 6, cy + 6, 12, 12);
      ctx.fillStyle = "#ffd896";
    });

    // 3. Top Banner Header
    ctx.textAlign = "center";
    ctx.fillStyle = "#f59e0b";
    ctx.font = 'bold 26px "Press Start 2P", monospace, sans-serif';
    ctx.fillText("MINECRAFT LIFE JOURNAL", width / 2, margin + 65);

    ctx.fillStyle = "rgba(255, 224, 176, 0.65)";
    ctx.font = 'bold 20px "Silkscreen", monospace, sans-serif';
    ctx.fillText("★ OFFICIAL MLJ CARD ★", width / 2, margin + 105);

    // 4. Hero World Cover Image
    const imgX = margin + 45;
    const imgY = margin + 140;
    const imgW = width - (margin + 45) * 2;
    const imgH = isStory ? 680 : 380;

    // Outer frame for hero image
    ctx.fillStyle = "#000000";
    ctx.fillRect(imgX, imgY, imgW, imgH);

    // Try loading cover photo or draw stylized default landscape
    let coverLoaded = false;
    if (world?.coverImage) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, imgX, imgY, imgW, imgH);
            coverLoaded = true;
            resolve();
          };
          img.onerror = () => resolve();
          img.src = world.coverImage;
        });
      } catch {
        coverLoaded = false;
      }
    }

    if (!coverLoaded) {
      // Default Minecraft pixel terrain gradient
      const skyGrad = ctx.createLinearGradient(0, imgY, 0, imgY + imgH);
      skyGrad.addColorStop(0, "#1e3a8a");
      skyGrad.addColorStop(0.6, "#f59e0b");
      skyGrad.addColorStop(1, "#14532d");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(imgX, imgY, imgW, imgH);
    }

    // Gradient vignette over hero image so text stays legible
    const heroOverlay = ctx.createLinearGradient(0, imgY + imgH * 0.35, 0, imgY + imgH);
    heroOverlay.addColorStop(0, "transparent");
    heroOverlay.addColorStop(1, "rgba(10, 6, 4, 0.95)");
    ctx.fillStyle = heroOverlay;
    ctx.fillRect(imgX, imgY, imgW, imgH);

    ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
    ctx.lineWidth = 4;
    ctx.strokeRect(imgX, imgY, imgW, imgH);

    // World Name & Badge inside Hero
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = 'bold 44px "Press Start 2P", monospace, sans-serif';
    const worldTitle = world?.name || "Untitled World";
    ctx.fillText(worldTitle.slice(0, 24), imgX + 30, imgY + imgH - 75);

    // Mode & Version pill
    const modeText = `${(world?.mode || "survival").toUpperCase()} MODE • v${world?.mcVersion || "1.21"}`;
    ctx.fillStyle = "#ffd896";
    ctx.font = 'bold 22px "Silkscreen", monospace, sans-serif';
    ctx.fillText(modeText, imgX + 32, imgY + imgH - 32);

    // 5. Explorer Identity Section
    const idY = imgY + imgH + 40;
    ctx.fillStyle = "rgba(245, 158, 11, 0.08)";
    ctx.strokeStyle = "rgba(245, 158, 11, 0.25)";
    ctx.lineWidth = 2;
    ctx.fillRect(imgX, idY, imgW, 90);
    ctx.strokeRect(imgX, idY, imgW, 90);

    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255, 224, 176, 0.6)";
    ctx.font = 'bold 16px "Silkscreen", monospace, sans-serif';
    ctx.fillText("EXPLORER TAG", imgX + 25, idY + 32);

    ctx.fillStyle = "#ffd896";
    ctx.font = 'bold 26px "Silkscreen", monospace, sans-serif';
    ctx.fillText(creatorName, imgX + 25, idY + 68);

    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 224, 176, 0.6)";
    ctx.font = 'bold 16px "Silkscreen", monospace, sans-serif';
    ctx.fillText("WORLD ESTABLISHED", imgX + imgW - 25, idY + 32);

    ctx.fillStyle = "#ffffff";
    ctx.font = 'bold 22px "Silkscreen", monospace, sans-serif';
    ctx.fillText(formatDate(world?.startedAt), imgX + imgW - 25, idY + 68);

    // 6. Vital Stats Grid (4 Boxes)
    const statsY = idY + 120;
    const boxGap = 20;
    const boxW = (imgW - boxGap) / 2;
    const boxH = isStory ? 180 : 140;

    const statsData = [
      { label: "TOTAL PLAYTIME", value: playtimeText, icon: "⏳" },
      { label: "WORLD AGE", value: `${daysSurvived} DAYS`, icon: "📅" },
      { label: "MILESTONES LOGGED", value: `${memories.length}`, icon: "📜" },
      { label: "SAVED COORDINATES", value: `${coordinates.length}`, icon: "📍" },
    ];

    statsData.forEach((st, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = imgX + col * (boxW + boxGap);
      const by = statsY + row * (boxH + boxGap);

      ctx.fillStyle = "rgba(18, 12, 8, 0.9)";
      ctx.strokeStyle = "rgba(218, 165, 32, 0.3)";
      ctx.lineWidth = 2;
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.strokeRect(bx, by, boxW, boxH);

      // Icon & Label
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(255, 224, 176, 0.55)";
      ctx.font = 'bold 16px "Silkscreen", monospace, sans-serif';
      ctx.fillText(`${st.icon} ${st.label}`, bx + 25, by + 40);

      // Value
      ctx.fillStyle = "#ffd896";
      ctx.font = 'bold 36px "Press Start 2P", monospace, sans-serif';
      ctx.fillText(st.value, bx + 25, by + 105);
    });

    // 7. Footer Watermark
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 224, 176, 0.4)";
    ctx.font = 'bold 18px "Silkscreen", monospace, sans-serif';
    ctx.fillText("WWW.MLJ.APP • SYNC YOUR IN-GAME JOURNEY", width / 2, height - margin - 20);

    return canvas;
  }

  // Handle Download PNG
  async function handleDownload() {
    setIsExporting(true);
    try {
      const canvas = await generateCardCanvas(format);
      if (!canvas) return;

      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      const safeName = (world?.name || "world").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `${safeName}-mlj-card-${format}.png`;
      a.href = dataUrl;
      a.click();

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  }

  // Handle Copy to Clipboard
  async function handleCopy() {
    setIsExporting(true);
    try {
      const canvas = await generateCardCanvas(format);
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          // Fallback if clipboard API blocked
          handleDownload();
        } finally {
          setIsExporting(false);
        }
      });
    } catch (err) {
      console.error("Copy error:", err);
      setIsExporting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-start p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-4xl bg-[#120d09] border-2 border-amber-500/40 rounded-xl shadow-[0_20px_70px_rgba(0,0,0,0.9)] overflow-hidden z-10 flex flex-col my-auto max-h-[92vh] shrink-0"
        >
          {/* Top Bar Header */}
          <div className="px-5 py-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-black/50 to-amber-950/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <MinecraftCardIcon size={24} className="drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]" />
              <div>
                <h3
                  className="text-sm font-bold text-amber-200"
                  style={{ fontFamily: "'Press Start 2P', monospace" }}
                >
                  MLJ Card
                </h3>
                <p className="text-[11px] text-amber-200/50 font-mono">
                  Collectible card for Instagram Stories, Reddit, or Discord
                </p>
              </div>
            </div>

            {/* Format Toggle Buttons */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-lg bg-black/50 border border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setFormat("story")}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    format === "story"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-amber-200/60 hover:text-amber-200"
                  }`}
                >
                  <Smartphone size={13} />
                  <span>Story (9:16)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("square")}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    format === "square"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-amber-200/60 hover:text-amber-200"
                  }`}
                >
                  <Square size={13} />
                  <span>Post (1:1)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-amber-200/50 hover:text-amber-200 hover:bg-amber-500/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Body / Live Card Preview */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex flex-col items-center bg-black/40">
            <div
              className={`my-auto shrink-0 relative overflow-hidden rounded-xl border-2 border-amber-500/40 shadow-2xl transition-all duration-300 flex flex-col justify-between ${
                format === "story"
                  ? "w-[330px] h-[590px] sm:w-[360px] sm:h-[640px]"
                  : "w-[340px] h-[360px] sm:w-[420px] sm:h-[420px]"
              }`}
              style={{
                backgroundColor: "#0d0906",
                boxShadow: "0 0 40px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255, 220, 150, 0.15)",
              }}
            >
              {/* Gold Pixel Border */}
              <div className="absolute inset-2 border border-amber-500/30 rounded-lg pointer-events-none" />

              {/* Corner Pixel Brackets */}
              <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
              <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-amber-400" />

              {/* Top Banner */}
              <div className="pt-4 text-center z-10 px-4">
                <p
                  className="text-[10px] sm:text-[11px] font-bold text-amber-400 uppercase tracking-widest"
                  style={{ fontFamily: "'Press Start 2P', monospace" }}
                >
                  Minecraft Life Journal
                </p>
                <p
                  className="text-[9px] text-amber-200/60 uppercase tracking-wider mt-0.5"
                  style={{ fontFamily: "'Silkscreen', cursive" }}
                >
                  ★ Official MLJ Card ★
                </p>
              </div>

              {/* Hero Image Section */}
              <div className="px-4 py-2 z-10">
                <div
                  className={`relative rounded-lg overflow-hidden border border-amber-500/40 bg-black ${
                    format === "story" ? "h-44 sm:h-52" : "h-24 sm:h-32"
                  }`}
                >
                  {world?.coverImage ? (
                    <img
                      src={world.coverImage}
                      alt={world.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-blue-950 via-amber-900 to-emerald-950 flex items-center justify-center">
                      <span className="text-3xl">⚔️</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Overlaid Title */}
                  <div className="absolute bottom-2.5 left-3 right-3">
                    <h4
                      className="text-sm sm:text-base font-bold text-white truncate drop-shadow-md"
                      style={{ fontFamily: "'Press Start 2P', monospace" }}
                    >
                      {world?.name || "Untitled World"}
                    </h4>
                    <p
                      className="text-[10px] text-amber-300 font-bold mt-1 uppercase"
                      style={{ fontFamily: "'Silkscreen', cursive" }}
                    >
                      {world?.mode || "Survival"} Mode • v{world?.mcVersion || "1.21"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Explorer Tag */}
              <div className="px-4 z-10">
                <div className="p-2 sm:p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[8px] text-amber-200/50 uppercase font-mono">Explorer</p>
                    <p
                      className="font-bold text-amber-200 text-xs sm:text-sm"
                      style={{ fontFamily: "'Silkscreen', cursive" }}
                    >
                      {creatorName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-amber-200/50 uppercase font-mono">Established</p>
                    <p className="font-mono text-[10px] sm:text-xs text-amber-100/90 font-bold">
                      {formatDate(world?.startedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="px-4 z-10">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 sm:p-2.5 rounded-lg bg-black/50 border border-amber-500/20">
                    <p className="text-[8px] text-amber-200/50 font-mono">⏳ PLAYTIME</p>
                    <p
                      className="text-xs sm:text-sm font-bold text-amber-200 mt-0.5 truncate"
                      style={{ fontFamily: "'Press Start 2P', monospace" }}
                    >
                      {playtimeText}
                    </p>
                  </div>

                  <div className="p-2 sm:p-2.5 rounded-lg bg-black/50 border border-amber-500/20">
                    <p className="text-[8px] text-amber-200/50 font-mono">📅 DAYS SURVIVED</p>
                    <p
                      className="text-xs sm:text-sm font-bold text-amber-200 mt-0.5"
                      style={{ fontFamily: "'Press Start 2P', monospace" }}
                    >
                      {daysSurvived} D
                    </p>
                  </div>

                  <div className="p-2 sm:p-2.5 rounded-lg bg-black/50 border border-amber-500/20">
                    <p className="text-[8px] text-amber-200/50 font-mono">📜 MILESTONES</p>
                    <p
                      className="text-xs sm:text-sm font-bold text-amber-200 mt-0.5"
                      style={{ fontFamily: "'Press Start 2P', monospace" }}
                    >
                      {memories.length}
                    </p>
                  </div>

                  <div className="p-2 sm:p-2.5 rounded-lg bg-black/50 border border-amber-500/20">
                    <p className="text-[8px] text-amber-200/50 font-mono">📍 COORDINATES</p>
                    <p
                      className="text-xs sm:text-sm font-bold text-amber-200 mt-0.5"
                      style={{ fontFamily: "'Press Start 2P', monospace" }}
                    >
                      {coordinates.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Wax Stamp & Watermark Footer */}
              <div className="pb-3 text-center z-10 px-4">
                <p className="text-[8px] text-amber-200/40 uppercase tracking-widest font-mono">
                  ★ VERIFIED RECORD • MLJ.APP ★
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="px-5 py-3.5 border-t border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-black/40 to-amber-950/30 flex items-center justify-end gap-3 shrink-0">
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                disabled={isExporting}
                onClick={handleCopy}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-bold text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Image"}</span>
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={handleDownload}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                style={{ fontFamily: "'Silkscreen', cursive" }}
              >
                {downloaded ? <Check size={14} /> : <Download size={14} />}
                <span>{downloaded ? "Downloaded!" : isExporting ? "Generating..." : "Download PNG"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
