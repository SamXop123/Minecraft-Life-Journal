"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PixelParticles from "@/components/PixelParticles";
import EditProfileModal from "@/components/EditProfileModal";
import { 
  User, 
  Calendar, 
  MapPin, 
  Mail, 
  Gamepad2, 
  Swords, 
  BookOpen, 
  CalendarDays,
  ChevronLeft,
  Sparkles,
  PenLine
} from "lucide-react";

const LEVEL_LABELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  veteran: "Veteran",
};

const LEVEL_COLORS = {
  beginner: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", text: "#86efac", glow: "rgba(34,197,94,0.4)" },
  intermediate: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", text: "#93c5fd", glow: "rgba(59,130,246,0.4)" },
  veteran: { bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.3)", text: "#c4b5fd", glow: "rgba(168,85,247,0.4)" },
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function calculateAgeFromDate(ageString) {
  if (!ageString) return "—";
  return ageString;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  async function fetchProfile() {
    let token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      let res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
        });

        if (!refreshRes.ok) {
          localStorage.removeItem("accessToken");
          router.push("/login");
          return;
        }

        const refreshData = await refreshRes.json();
        token = refreshData.accessToken;
        localStorage.setItem("accessToken", token);

        res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setProfile(data.profile);
    } catch (err) {
      console.error("Failed to fetch profile:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0c0703" }}
      >
        <motion.div 
          className="flex flex-col items-center gap-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-amber-200/60 text-sm font-medium tracking-widest uppercase">
            Loading Data...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "#0c0703" }}
      >
        <p style={{ color: "rgba(255,224,176,0.6)" }}>Could not load profile.</p>
        <Link
          href="/dashboard"
          className="text-amber-500/70 hover:text-amber-400 transition-colors text-sm flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const lvl = LEVEL_COLORS[profile.experienceLevel] || LEVEL_COLORS.beginner;

  return (
    <div className="relative min-h-screen overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-100">
      {/* Dynamic Backgrounds */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center center", zIndex: 0 }}
      >
        <img
          src="/minecraft-hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
          draggable={false}
        />
      </motion.div>

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse at top, rgba(15,10,3,0.7) 0%, rgba(8,4,1,0.95) 100%)",
        }}
      />

      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background:
            "radial-gradient(circle at 80% 20%, rgba(218,165,32,0.08) 0%, transparent 50%)",
        }}
        animate={{ 
          background: [
            "radial-gradient(circle at 80% 20%, rgba(218,165,32,0.08) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 25%, rgba(218,165,32,0.12) 0%, transparent 55%)",
            "radial-gradient(circle at 80% 20%, rgba(218,165,32,0.08) 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background:
            "radial-gradient(circle at 20% 80%, rgba(168,85,247,0.05) 0%, transparent 50%)",
        }}
        animate={{ 
          background: [
            "radial-gradient(circle at 20% 80%, rgba(168,85,247,0.05) 0%, transparent 50%)",
            "radial-gradient(circle at 25% 75%, rgba(168,85,247,0.08) 0%, transparent 55%)",
            "radial-gradient(circle at 20% 80%, rgba(168,85,247,0.05) 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="fixed inset-0 pointer-events-none opacity-50" style={{ zIndex: 3 }}>
        <PixelParticles count={25} />
      </div>

      {/* Main Content Area */}
      <div className="relative px-4 py-12 md:py-20 min-h-screen" style={{ zIndex: 10 }}>
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          
          {/* Top Bar Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-between items-center mb-4"
          >
            <Link
              href="/dashboard"
              className="flex items-center gap-2 group text-amber-200/50 hover:text-amber-200 transition-colors text-sm font-medium bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Return to Dashboard
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Profile Identity */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="backdrop-blur-2xl rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden group"
                style={{
                  background: "linear-gradient(145deg, rgba(20,15,10,0.7) 0%, rgba(10,5,2,0.8) 100%)",
                  border: "1px solid rgba(255,200,100,0.08)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)"
                }}
              >
                {/* Decorative background glow inside card */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-[3rem] group-hover:bg-amber-500/20 transition-colors duration-700" />
                
                {/* Avatar with animated glowing rings */}
                <div className="relative mb-6 group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 rounded-full blur-xl scale-110 opacity-50" style={{ backgroundColor: lvl.glow, zIndex: 0 }} />
                  <div 
                    className="w-32 h-32 rounded-full overflow-hidden relative z-10 flex items-center justify-center bg-black/60 shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                    style={{ border: `3px solid ${lvl.bg}` }}
                  >
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-amber-100/30">
                        {profile.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <motion.div 
                    className="absolute -bottom-2 -right-2 bg-black/80 rounded-full p-2 border border-white/10 text-amber-400 z-20 backdrop-blur-md"
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Sparkles size={16} />
                  </motion.div>
                </div>

                <h1 className="text-3xl font-black mb-1 bg-gradient-to-br from-amber-100 via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
                  {profile.username}
                </h1>
                
                {profile.displayName && (
                  <p className="text-amber-100/50 text-sm font-medium mb-4">
                    {profile.displayName}
                  </p>
                )}

                {profile.experienceLevel && (
                  <div 
                    className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-lg"
                    style={{
                      backgroundColor: lvl.bg,
                      border: `1px solid ${lvl.border}`,
                      color: lvl.text,
                      boxShadow: `0 0 15px ${lvl.bg}`
                    }}
                  >
                    {LEVEL_LABELS[profile.experienceLevel]}
                  </div>
                )}

                <button
                  onClick={() => setShowEdit(true)}
                  className="w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group/btn"
                  style={{
                    backgroundColor: "rgba(218,165,32,0.1)",
                    border: "1px solid rgba(218,165,32,0.3)",
                    color: "#ffd896",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                  <PenLine size={16} className="group-hover/btn:scale-110 transition-transform" />
                  Edit Profile
                </button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="backdrop-blur-xl rounded-2xl p-5 flex items-center gap-4"
                style={{
                  background: "rgba(10,5,2,0.4)",
                  border: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <div className="p-3 bg-white/5 rounded-xl text-amber-200/40">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <p className="text-xs text-amber-200/40 uppercase tracking-widest font-semibold mb-0.5">Joined</p>
                  <p className="text-sm font-medium text-amber-100/80">{formatDate(profile.joinedAt || profile.createdAt)}</p>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Bento Details */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-6">
                <BentoCard icon={<User size={20}/>} label="Real Name" value={profile.realName} delay={0.2} />
                <BentoCard icon={<Calendar size={20} className="lucide-calendar" />} fallbackIcon={<CalendarDays size={20}/>} label="Age" value={profile.age} delay={0.3} />
                <BentoCard icon={<MapPin size={20}/>} label="Country" value={profile.country} delay={0.4} />
                <BentoCard icon={<Mail size={20}/>} label="Email" value={profile.email} delay={0.5} />
              </div>

              {/* Preferences Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}
                  className="backdrop-blur-xl rounded-2xl p-6 group relative overflow-hidden h-full"
                  style={{ background: "rgba(10,5,2,0.6)", border: "1px solid rgba(218,165,32,0.1)" }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-amber-200/50 mb-4 flex items-center gap-2">
                    <Gamepad2 size={16} className="text-amber-500/70" /> Game Modes
                  </h3>
                  {profile.favoriteGameModes?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.favoriteGameModes.map(mode => (
                        <span key={mode} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-500/10 border border-amber-500/20 text-amber-200/90 hover:bg-amber-500/20 hover:-translate-y-0.5 transition-transform cursor-default shadow-sm">
                          {mode}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-amber-100/30 text-sm italic">No game modes selected yet.</p>
                  )}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}
                  className="backdrop-blur-xl rounded-2xl p-6 group relative overflow-hidden h-full"
                  style={{ background: "rgba(10,5,2,0.6)", border: "1px solid rgba(16,185,129,0.1)" }}
                >
                  <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-200/50 mb-4 flex items-center gap-2">
                    <Swords size={16} className="text-emerald-500/70" /> Activities
                  </h3>
                  {profile.favoriteActivities?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.favoriteActivities.map(act => (
                        <span key={act} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-200/90 hover:bg-emerald-500/20 hover:-translate-y-0.5 transition-transform cursor-default shadow-sm">
                          {act}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-emerald-100/30 text-sm italic">No activities selected yet.</p>
                  )}
                </motion.div>
              </div>

              {/* Biography Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }}
                className="backdrop-blur-xl rounded-2xl p-6 md:p-8 relative overflow-hidden"
                style={{ 
                  background: "linear-gradient(180deg, rgba(15,10,5,0.6) 0%, rgba(5,2,0,0.8) 100%)", 
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderLeft: "4px solid rgba(218,165,32,0.4)"
                }}
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-amber-200/40 mb-4 flex items-center gap-2">
                  <BookOpen size={18} className="text-amber-500/50" />
                  Biography
                </h3>
                {profile.bio ? (
                  <p className="text-base text-amber-50/80 leading-relaxed whitespace-pre-wrap font-light">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-amber-100/30 text-sm italic flex items-center gap-2">
                    This user prefers to keep an air of mystery.
                  </p>
                )}
              </motion.div>

            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEdit && (
          <EditProfileModal
            profile={profile}
            onClose={() => setShowEdit(false)}
            onSaved={(updated) => {
              setProfile(updated);
              setShowEdit(false);
              fetchProfile();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable Bento Card component
function BentoCard({ icon, fallbackIcon, label, value, delay = 0 }) {
  // Use fallback if main icon fails to render due to import issues (CalendarDate isn't standard in lucide)
  const displayIcon = icon || fallbackIcon;
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="backdrop-blur-xl rounded-2xl p-5 group relative overflow-hidden hover:-translate-y-1 transition-all duration-300"
      style={{
        backgroundColor: "rgba(10, 5, 2, 0.5)",
        border: "1px solid rgba(255,255,255,0.04)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-start gap-4 relative z-10">
        <div className="p-3 my-auto rounded-xl bg-gradient-to-br from-black/60 to-black/40 text-amber-400 border border-amber-500/10 shadow-inner group-hover:scale-110 group-hover:text-amber-300 group-hover:border-amber-500/30 transition-all duration-300">
          {displayIcon}
        </div>
        <div className="flex flex-col justify-center gap-0.5 min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-bold text-amber-200/30 uppercase tracking-[0.2em] shrink-0">{label}</p>
          <p 
            className="text-xs sm:text-sm text-amber-50/90 font-medium tracking-wide truncate"
            title={value || ""}
          >
            {value || "—"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
