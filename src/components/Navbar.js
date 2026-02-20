"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const HIDDEN_ROUTES = ["/login", "/register", "/"];

/* ─── Tiny pixel pickaxe icon with hover animation ─── */
function PickaxeIcon() {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0"
      aria-hidden="true"
      whileHover={{ rotate: -15, scale: 1.1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Handle */}
      <rect x="2" y="12" width="3" height="3" rx="0.5" fill="#8B6914" />
      <rect x="4" y="10" width="3" height="3" rx="0.5" fill="#A07818" />
      <rect x="6" y="8" width="3" height="3" rx="0.5" fill="#A07818" />
      {/* Head */}
      <rect x="8" y="6" width="3" height="3" rx="0.5" fill="#7C8A96" />
      <rect x="10" y="4" width="3" height="3" rx="0.5" fill="#99AAB5" />
      <rect x="12" y="2" width="3" height="3" rx="0.5" fill="#B0BEC5" />
      <rect x="10" y="2" width="2" height="2" rx="0.5" fill="#8D9DA8" />
      <rect x="12" y="4" width="2" height="2" rx="0.5" fill="#8D9DA8" />
    </motion.svg>
  );
}

/* ─── Small decorative pixels ─── */
function DecorativePixels() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-amber-400/40"
          style={{
            left: `${15 + i * 15}%`,
            top: "50%",
            boxShadow: "0 0 3px rgba(255,180,60,0.3)",
          }}
          animate={{
            y: [-2, 2, -2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(!!localStorage.getItem("accessToken"));
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("accessToken");
    router.push("/login");
  }

  // Hide navbar on public/landing/auth routes
  if (
    HIDDEN_ROUTES.includes(pathname) ||
    pathname.startsWith("/public/")
  ) {
    return null;
  }

  return (
    <motion.nav
      className="relative z-50 backdrop-blur-lg"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Dark glass background with layered depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          borderBottom: "1px solid rgba(218,165,32,0.15)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,200,100,0.03)",
        }}
      />

      {/* Animated warm glow pulse */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,180,60,0.05) 0%, transparent 100%)",
        }}
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Bottom edge — golden highlight with shimmer */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 5%, rgba(218,165,32,0.25) 50%, transparent 95%)",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Decorative floating pixels */}
      <DecorativePixels />

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand with Minecraft nameplate style */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group relative"
        >
          {/* Decorative frame around brand */}
          <div
            className="absolute -inset-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: "rgba(218,165,32,0.08)",
              border: "1px solid rgba(218,165,32,0.15)",
              boxShadow: "0 0 20px rgba(255,170,60,0.1), inset 0 1px 0 rgba(255,200,100,0.1)",
            }}
          />
          
          <div className="relative flex items-center gap-3">
            {/* Pixel corners decoration */}
            <div className="absolute -left-1 -top-1 w-1 h-1 bg-amber-400/30" />
            <div className="absolute -right-1 -top-1 w-1 h-1 bg-amber-400/30" />
            
            <PickaxeIcon />
            <span
              className="font-bold text-lg tracking-tight transition-all duration-200"
              style={{
                color: "#ffe0b0",
                textShadow: "0 2px 12px rgba(0,0,0,0.8), 0 0 30px rgba(255,170,60,0.15), 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <span className="group-hover:text-amber-200 transition-colors duration-200">
                Minecraft
              </span>{" "}
              <span className="text-amber-500/80 group-hover:text-amber-400/90 transition-colors duration-200">
                Life Journal
              </span>
            </span>
          </div>
        </Link>

        {/* Nav links */}
        {authenticated && (
          <div className="flex items-center gap-2">
            {/* Dashboard Link - Minecraft button style */}
            <Link
              href="/dashboard"
              className="relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200"
              style={{
                color: pathname === "/dashboard" ? "#ffd896" : "#b89868",
                textShadow: "0 1px 6px rgba(0,0,0,0.8), 0 -1px 0 rgba(0,0,0,0.3)",
                backgroundColor: pathname === "/dashboard" 
                  ? "rgba(218,165,32,0.15)" 
                  : "rgba(0,0,0,0.2)",
                border: "2px solid",
                borderTopColor: pathname === "/dashboard"
                  ? "rgba(255,200,100,0.3)"
                  : "rgba(218,165,32,0.12)",
                borderRightColor: pathname === "/dashboard"
                  ? "rgba(160,100,30,0.4)"
                  : "rgba(80,50,15,0.3)",
                borderBottomColor: pathname === "/dashboard"
                  ? "rgba(80,50,15,0.5)"
                  : "rgba(60,40,10,0.4)",
                borderLeftColor: pathname === "/dashboard"
                  ? "rgba(218,165,32,0.2)"
                  : "rgba(100,60,20,0.25)",
                boxShadow: pathname === "/dashboard"
                  ? "0 2px 8px rgba(218,165,32,0.2), inset 0 1px 0 rgba(255,200,100,0.1)"
                  : "0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,200,100,0.03)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ffd896";
                e.currentTarget.style.backgroundColor = "rgba(218,165,32,0.2)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(218,165,32,0.25), inset 0 1px 0 rgba(255,200,100,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color =
                  pathname === "/dashboard" ? "#ffd896" : "#b89868";
                e.currentTarget.style.backgroundColor =
                  pathname === "/dashboard" 
                    ? "rgba(218,165,32,0.15)" 
                    : "rgba(0,0,0,0.2)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = pathname === "/dashboard"
                  ? "0 2px 8px rgba(218,165,32,0.2), inset 0 1px 0 rgba(255,200,100,0.1)"
                  : "0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,200,100,0.03)";
              }}
            >
              Dashboard
              {pathname === "/dashboard" && (
                <motion.div
                  className="absolute -bottom-1 left-1 right-1 h-0.5 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(218,165,32,0.5), rgba(255,180,60,0.7), rgba(218,165,32,0.5))",
                    boxShadow: "0 0 8px rgba(255,170,60,0.5)",
                  }}
                  layoutId="navIndicator"
                />
              )}
            </Link>

            {/* Separator */}
            <div className="flex flex-col gap-0.5 mx-1">
              <div className="w-px h-1.5" style={{ backgroundColor: "rgba(218,165,32,0.2)" }} />
              <div className="w-px h-1.5" style={{ backgroundColor: "rgba(218,165,32,0.15)" }} />
              <div className="w-px h-1.5" style={{ backgroundColor: "rgba(218,165,32,0.1)" }} />
            </div>

            {/* Profile Link - Minecraft button style */}
            <Link
              href="/profile"
              className="relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200"
              style={{
                color: pathname === "/profile" ? "#ffd896" : "#b89868",
                textShadow: "0 1px 6px rgba(0,0,0,0.8), 0 -1px 0 rgba(0,0,0,0.3)",
                backgroundColor: pathname === "/profile"
                  ? "rgba(218,165,32,0.15)"
                  : "rgba(0,0,0,0.2)",
                border: "2px solid",
                borderTopColor: pathname === "/profile"
                  ? "rgba(255,200,100,0.3)"
                  : "rgba(218,165,32,0.12)",
                borderRightColor: pathname === "/profile"
                  ? "rgba(160,100,30,0.4)"
                  : "rgba(80,50,15,0.3)",
                borderBottomColor: pathname === "/profile"
                  ? "rgba(80,50,15,0.5)"
                  : "rgba(60,40,10,0.4)",
                borderLeftColor: pathname === "/profile"
                  ? "rgba(218,165,32,0.2)"
                  : "rgba(100,60,20,0.25)",
                boxShadow: pathname === "/profile"
                  ? "0 2px 8px rgba(218,165,32,0.2), inset 0 1px 0 rgba(255,200,100,0.1)"
                  : "0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,200,100,0.03)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ffd896";
                e.currentTarget.style.backgroundColor = "rgba(218,165,32,0.2)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(218,165,32,0.25), inset 0 1px 0 rgba(255,200,100,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color =
                  pathname === "/profile" ? "#ffd896" : "#b89868";
                e.currentTarget.style.backgroundColor =
                  pathname === "/profile"
                    ? "rgba(218,165,32,0.15)"
                    : "rgba(0,0,0,0.2)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = pathname === "/profile"
                  ? "0 2px 8px rgba(218,165,32,0.2), inset 0 1px 0 rgba(255,200,100,0.1)"
                  : "0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,200,100,0.03)";
              }}
            >
              Profile
              {pathname === "/profile" && (
                <motion.div
                  className="absolute -bottom-1 left-1 right-1 h-0.5 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(218,165,32,0.5), rgba(255,180,60,0.7), rgba(218,165,32,0.5))",
                    boxShadow: "0 0 8px rgba(255,170,60,0.5)",
                  }}
                  layoutId="navIndicator"
                />
              )}
            </Link>

            {/* Separator */}
            <div className="flex flex-col gap-0.5 mx-1">
              <div className="w-px h-1.5" style={{ backgroundColor: "rgba(218,165,32,0.2)" }} />
              <div className="w-px h-1.5" style={{ backgroundColor: "rgba(218,165,32,0.15)" }} />
              <div className="w-px h-1.5" style={{ backgroundColor: "rgba(218,165,32,0.1)" }} />
            </div>

            {/* Logout Button - Minecraft button style */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200"
              style={{
                color: "#b89868",
                textShadow: "0 1px 6px rgba(0,0,0,0.8), 0 -1px 0 rgba(0,0,0,0.3)",
                backgroundColor: "rgba(0,0,0,0.25)",
                border: "2px solid",
                borderTopColor: "rgba(218,165,32,0.12)",
                borderRightColor: "rgba(80,50,15,0.3)",
                borderBottomColor: "rgba(60,40,10,0.4)",
                borderLeftColor: "rgba(100,60,20,0.25)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,200,100,0.03)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ff9090";
                e.currentTarget.style.backgroundColor = "rgba(200,50,50,0.15)";
                e.currentTarget.style.borderTopColor = "rgba(255,100,100,0.2)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(200,50,50,0.2), inset 0 1px 0 rgba(255,150,150,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#b89868";
                e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.25)";
                e.currentTarget.style.borderTopColor = "rgba(218,165,32,0.12)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,200,100,0.03)";
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
