"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

const SETTINGS_KEY = "mlj_user_settings";

export const THEMES = [
  {
    id: "hero",
    name: "Overworld Hero",
    image: "/minecraft-hero.jpg",
    type: "image",
    description: "Classic grassy peaks & bright daytime sky",
    defaultParticle: "gold",
  },
  {
    id: "end",
    name: "The End Dimension",
    image: "/end.png",
    type: "image",
    description: "Ender dragon sky & obsidian void",
    defaultParticle: "end_shimmer",
  },
  {
    id: "enhanced",
    name: "Enhanced Cinematic",
    image: "/enhanced-mc-art.jpg",
    type: "image",
    description: "Vibrant cinematic block landscape",
    defaultParticle: "gold",
  },
  {
    id: "cherry",
    name: "Cherry Grove",
    image: "/cherry.jpg",
    type: "image",
    description: "Serene pink blossom forest environment",
    defaultParticle: "cherry",
  },
  {
    id: "walkpath",
    name: "Forest Walkpath",
    image: "/walkpath.png",
    type: "image",
    description: "Scenic dirt path through deep forest",
    defaultParticle: "gold",
  },
  {
    id: "sun_day",
    name: "Bright Sunny Day",
    image: "/sun_day.png",
    type: "image",
    description: "Vivid blue sky over green hills",
    defaultParticle: "gold",
  },
  {
    id: "forest",
    name: "Lush Forest",
    image: "/forest.png",
    type: "image",
    description: "Dense green canopy & ancient trees",
    defaultParticle: "gold",
  },
  {
    id: "sunrise",
    name: "Golden Sunrise",
    image: "/sunrise.jpg",
    type: "image",
    description: "Warm golden dawn breaking over horizon",
    defaultParticle: "gold",
  },
  {
    id: "nether",
    name: "Nether Fortress",
    type: "gradient",
    background: "linear-gradient(135deg, #180808 0%, #380b0b 50%, #1a0505 100%)",
    description: "Dark obsidian & fiery lava atmospheric glow",
    defaultParticle: "nether",
  },
];

export const PARTICLE_OPTIONS = [
  { id: "auto", name: "Auto (Theme Matched)", description: "Automatically matches active theme" },
  { id: "gold", name: "Gold Dust", description: "Floating warm gold & emerald sparkles" },
  { id: "cherry", name: "Cherry Petals", description: "Soft pink & magenta drifting petals" },
  { id: "nether", name: "Nether Embers", description: "Fiery red & orange rising ash embers" },
  { id: "snow", name: "Snowfall", description: "Crisp white falling snowflakes" },
  { id: "end_shimmer", name: "Void Shimmer", description: "Mystic purple & indigo glowing dust" },
  { id: "off", name: "Disabled", description: "Turn off background particles" },
];

export const MOTION_OPTIONS = [
  { id: "full", name: "Full Motion", description: "Smooth background scale zoom & normal particles" },
  { id: "reduced", name: "Reduced Motion", description: "Static background & slow, low-density particles" },
  { id: "off", name: "Off", description: "No background motion or particles for max performance" },
];

const DEFAULT_SETTINGS = {
  audioAutoplay: false, // Muted/closed by default on site open
  audioVolume: 0.2,
  themeBackground: "hero",
  particleEffect: "auto",
  motionMode: "full",
  pixelFonts: true,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error("Failed to load user settings from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Update & persist settings
  const updateSettings = useCallback((newPartial) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save user settings to localStorage:", e);
      }
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (e) {
      console.error("Failed to reset user settings in localStorage:", e);
    }
  }, []);

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);
  const toggleSettings = useCallback(() => setIsSettingsOpen((prev) => !prev), []);

  // Compute effective particle effect when "auto" is chosen
  const effectiveParticleEffect = useMemo(() => {
    if (settings.particleEffect !== "auto") {
      return settings.particleEffect;
    }
    const currentTheme = THEMES.find((t) => t.id === settings.themeBackground);
    return currentTheme ? currentTheme.defaultParticle : "gold";
  }, [settings.particleEffect, settings.themeBackground]);

  // Compute active theme object
  const activeTheme = useMemo(() => {
    return THEMES.find((t) => t.id === settings.themeBackground) || THEMES[0];
  }, [settings.themeBackground]);

  const value = useMemo(
    () => ({
      settings,
      isLoaded,
      isSettingsOpen,
      effectiveParticleEffect,
      activeTheme,
      openSettings,
      closeSettings,
      toggleSettings,
      updateSettings,
      resetSettings,
    }),
    [
      settings,
      isLoaded,
      isSettingsOpen,
      effectiveParticleEffect,
      activeTheme,
      openSettings,
      closeSettings,
      toggleSettings,
      updateSettings,
      resetSettings,
    ]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
