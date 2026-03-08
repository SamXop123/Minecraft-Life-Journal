"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const AUDIO_KEY = "mlj-ambient-audio";
const AUDIO_VOLUME = 0.2;

export default function MusicButton() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio("/ambient.mp3");
      a.loop = true;
      a.volume = AUDIO_VOLUME;
      audioRef.current = a;
    }
    return audioRef.current;
  }, []);

  // Restore saved state on mount (visual only — can't autoplay without gesture)
  useEffect(() => {
    const saved = localStorage.getItem(AUDIO_KEY);
    if (saved === "on") setPlaying(true);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // If state is restored as "on", attempt play on next user interaction
  useEffect(() => {
    if (!playing) return;

    const tryPlay = () => {
      const audio = getAudio();
      audio.play().catch(() => {});
    };

    const audio = getAudio();
    const p = audio.play();
    if (p && p.catch) {
      p.catch(() => {
        window.addEventListener("click", tryPlay, { once: true });
        window.addEventListener("keydown", tryPlay, { once: true });
      });
    }

    return () => {
      window.removeEventListener("click", tryPlay);
      window.removeEventListener("keydown", tryPlay);
    };
  }, [playing, getAudio]);

  const toggle = () => {
    const audio = getAudio();
    if (playing) {
      audio.pause();
      setPlaying(false);
      localStorage.setItem(AUDIO_KEY, "off");
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
      localStorage.setItem(AUDIO_KEY, "on");
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "Mute ambient sound" : "Play ambient sound"}
      className="fixed bottom-5 right-5 z-50 w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-sm border text-lg cursor-pointer select-none transition-all duration-200"
      style={{
        backgroundColor: playing ? "rgba(218,165,32,0.18)" : "rgba(255,255,255,0.08)",
        borderColor: playing ? "rgba(218,165,32,0.35)" : "rgba(255,255,255,0.12)",
        boxShadow: playing ? "0 0 14px rgba(218,165,32,0.2)" : "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = playing
          ? "rgba(218,165,32,0.28)"
          : "rgba(255,255,255,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = playing
          ? "rgba(218,165,32,0.18)"
          : "rgba(255,255,255,0.08)";
      }}
    >
      {playing ? "🔊" : "🔇"}
    </button>
  );
}
