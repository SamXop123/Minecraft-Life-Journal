"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useSettings } from "@/context/SettingsContext";

export default function MusicButton() {
  const { settings, isLoaded } = useSettings();
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio("/ambient.mp3");
      a.loop = true;
      a.volume = settings.audioVolume;
      audioRef.current = a;
    }
    return audioRef.current;
  }, [settings.audioVolume]);

  // Update volume dynamically when settings volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.audioVolume;
    }
  }, [settings.audioVolume]);

  // Initialize playback state based on audioAutoplay setting once settings are loaded
  useEffect(() => {
    if (!isLoaded) return;
    if (settings.audioAutoplay) {
      setPlaying(true);
    }
  }, [isLoaded, settings.audioAutoplay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle play/pause when playing state changes
  useEffect(() => {
    if (!playing) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

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
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
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
