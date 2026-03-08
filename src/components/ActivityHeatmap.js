"use client";

import { useEffect, useState, useCallback } from "react";

export default function ActivityHeatmap({ worldId }) {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const refreshAccessToken = useCallback(async () => {
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
    });

    if (!refreshRes.ok) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      return null;
    }

    const refreshData = await refreshRes.json();
    localStorage.setItem("accessToken", refreshData.accessToken);
    return refreshData.accessToken;
  }, []);

  const fetchWithAuthRetry = useCallback(
    async (url, options = {}) => {
      let token = localStorage.getItem("accessToken");

      if (!token) {
        window.location.href = "/login";
        return null;
      }

      const request = async (accessToken) =>
        fetch(url, {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${accessToken}`,
          },
        });

      let res = await request(token);

      if (res.status === 401) {
        token = await refreshAccessToken();

        if (!token) {
          return null;
        }

        res = await request(token);
      }

      return res;
    },
    [refreshAccessToken]
  );

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetchWithAuthRetry(`/api/activity/${worldId}`);

      if (!res) {
        return;
      }

      if (!res.ok) return;
      const data = await res.json();
      setActivityData(data.activity || []);
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuthRetry, worldId]);

  useEffect(() => {
    if (worldId) fetchActivity();
  }, [worldId, fetchActivity]);

  // Build lookup map: "YYYY-MM-DD" → activity record
  const activityMap = {};
  for (const entry of activityData) {
    const key = new Date(entry.date).toISOString().slice(0, 10);
    activityMap[key] = entry;
  }

  // Generate the last 6 months of days
  const days = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = 181; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  // Determine cell state
  const getState = (dateStr) => {
    const entry = activityMap[dateStr];
    if (!entry) return "empty";
    if (entry.memoryCount > 0) return "memory";
    if (entry.played) return "played";
    return "empty";
  };

  const cellColor = {
    empty: "bg-white/5 border border-white/10",
    played: "bg-green-500/80 border border-green-400/40 shadow-[0_0_4px_rgba(34,197,94,0.3)]",
    memory: "bg-blue-500/80 border border-blue-400/40 shadow-[0_0_4px_rgba(59,130,246,0.3)]",
  };

  // Arrange into columns (weeks). Each column = 7 days (Sun–Sat).
  // Pad the start so column 0 starts on Sunday.
  const firstDay = new Date(days[0] + "T00:00:00Z").getUTCDay(); // 0=Sun
  const padded = Array(firstDay).fill(null).concat(days);
  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const validDay = week.find((d) => d !== null);
    if (!validDay) return;
    const m = new Date(validDay + "T00:00:00Z").getUTCMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      monthLabels.push({
        index: wi,
        label: new Date(validDay + "T00:00:00Z").toLocaleString("default", {
          month: "short",
          timeZone: "UTC",
        }),
      });
    }
  });

  const handleMarkPlayed = async () => {
    setMarking(true);
    try {
      const res = await fetchWithAuthRetry("/api/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ worldId }),
      });

      if (!res) {
        return;
      }

      if (res.ok) await fetchActivity();
    } catch (err) {
      console.error("Failed to mark activity:", err);
    } finally {
      setMarking(false);
    }
  };

  const todayStr = today.toISOString().slice(0, 10);
  const playedToday = !!activityMap[todayStr];

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <div
      className="relative bg-black/40 backdrop-blur-lg border border-amber-700/25 rounded-xl p-5"
      style={{
        boxShadow:
          "0 2px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,100,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-amber-100 font-bold text-sm tracking-wide"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "0.7rem",
            textShadow: "0 1px 6px rgba(0,0,0,0.7)",
          }}
        >
          ⛏️ World Activity
        </h3>

        <button
          onClick={handleMarkPlayed}
          disabled={marking || playedToday}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
            playedToday
              ? "bg-green-500/20 border border-green-500/30 text-green-400 cursor-default"
              : "bg-amber-600/20 border border-amber-500/30 text-amber-300 hover:bg-amber-600/40 hover:border-amber-500/50 cursor-pointer"
          }`}
          style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "0.45rem" }}
        >
          {playedToday ? "✔ Played Today" : marking ? "Marking..." : "🎮 Mark Played"}
        </button>
      </div>

      {/* Heatmap grid */}
      {loading ? (
        <div className="flex items-center justify-center h-24">
          <span
            className="text-amber-300/50 text-xs"
            style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "0.5rem" }}
          >
            Loading...
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Month labels */}
          <div className="flex ml-8 mb-1" style={{ gap: "0px" }}>
            {weeks.map((_, wi) => {
              const label = monthLabels.find((m) => m.index === wi);
              return (
                <div
                  key={wi}
                  className="text-amber-300/50 text-center"
                  style={{
                    width: "12px",
                    marginRight: "3px",
                    fontSize: "0.55rem",
                    fontFamily: "'Silkscreen', cursive",
                  }}
                >
                  {label ? label.label : ""}
                </div>
              );
            })}
          </div>

          <div className="flex">
            {/* Day of week labels */}
            <div
              className="flex flex-col mr-1.5 justify-between"
              style={{ height: `${7 * 12 + 6 * 3}px` }}
            >
              {dayLabels.map((label, i) => (
                <span
                  key={i}
                  className="text-amber-300/40 leading-none"
                  style={{
                    fontSize: "0.5rem",
                    fontFamily: "'Silkscreen', cursive",
                    height: "12px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="flex" style={{ gap: "3px" }}>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: "3px" }}>
                  {Array.from({ length: 7 }).map((_, di) => {
                    const dateStr = week[di] || null;
                    if (!dateStr) {
                      return (
                        <div
                          key={di}
                          className="rounded-sm"
                          style={{ width: "12px", height: "12px" }}
                        />
                      );
                    }
                    const state = getState(dateStr);
                    const entry = activityMap[dateStr];
                    const tooltip = entry
                      ? `${dateStr} — ${entry.memoryCount} ${entry.memoryCount === 1 ? "memory" : "memories"}${entry.played ? ", played" : ""}`
                      : `${dateStr} — no activity`;

                    return (
                      <div
                        key={di}
                        title={tooltip}
                        className={`rounded-sm transition-colors duration-150 ${cellColor[state]}`}
                        style={{ width: "12px", height: "12px" }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-amber-700/15">
        <span
          className="text-amber-300/40"
          style={{ fontSize: "0.5rem", fontFamily: "'Silkscreen', cursive" }}
        >
          Less
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm bg-white/5 border border-white/10"
            title="No activity"
          />
          <div
            className="w-3 h-3 rounded-sm bg-green-500/80 border border-green-400/40"
            title="Played"
          />
          <div
            className="w-3 h-3 rounded-sm bg-blue-500/80 border border-blue-400/40"
            title="Memory logged"
          />
        </div>
        <span
          className="text-amber-300/40"
          style={{ fontSize: "0.5rem", fontFamily: "'Silkscreen', cursive" }}
        >
          More
        </span>

        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-green-500/80" />
            <span
              className="text-amber-300/50"
              style={{ fontSize: "0.5rem", fontFamily: "'Silkscreen', cursive" }}
            >
              Played
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-500/80" />
            <span
              className="text-amber-300/50"
              style={{ fontSize: "0.5rem", fontFamily: "'Silkscreen', cursive" }}
            >
              Memory
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
