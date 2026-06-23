"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CATEGORY_COLORS = {
  achievement: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  build: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  death: "bg-red-500/10 border-red-500/30 text-red-400",
  funny: "bg-pink-500/10 border-pink-500/30 text-pink-400",
  emotional: "bg-purple-500/10 border-purple-500/30 text-purple-400",
};

export default function PublicWorldPage({ params }) {
  const [world, setWorld] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPublicWorld() {
      try {
        const { id } = await params;

        const res = await fetch(`/api/public/world/${id}`);

        if (res.status === 404) {
          setError("World not found");
          return;
        }

        if (res.status === 403) {
          setError("This world is private");
          return;
        }

        if (!res.ok) {
          setError("Failed to load world");
          return;
        }

        const data = await res.json();
        setWorld(data.world);
        setMemories(data.memories || []);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchPublicWorld();
  }, [params]);

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatPlaytime(totalMinutes) {
    if (!totalMinutes || totalMinutes <= 0) return "0m";
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-gray-400 text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 gap-4">
        <p className="text-red-400 text-lg">{error}</p>
        <Link
          href="/"
          className="text-emerald-400 hover:underline text-sm"
        >
          ← Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Public Badge */}
        <div className="mb-6 flex items-center gap-2">
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs text-emerald-400">
            Public World
          </span>
        </div>

        {/* World Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">{world.name}</h1>
            {world.endedAt && (
              <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                Ended
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-0.5">Version</p>
              <p className="text-gray-300">{world.mcVersion}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">Mode</p>
              <p className="text-gray-300 capitalize">{world.mode}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">Type</p>
              <p className="text-gray-300 capitalize">{world.type}</p>
            </div>
            {world.seed && (
              <div>
                <p className="text-gray-500 mb-0.5">Seed</p>
                <p className="text-gray-300 font-mono text-xs">{world.seed}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500 mb-0.5">Started</p>
              <p className="text-gray-300">{formatDate(world.startedAt)}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">Playtime</p>
              <p className="text-gray-300">{formatPlaytime(world.playtimeMinutes)}</p>
            </div>
            {world.endedAt && (
              <div>
                <p className="text-gray-500 mb-0.5">Ended</p>
                <p className="text-gray-300">{formatDate(world.endedAt)}</p>
              </div>
            )}
          </div>

          {world.endedAt && (world.endReason || world.finalMessage) && (
            <div className="mt-5 pt-5 border-t border-gray-800 space-y-3">
              {world.endReason && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">End Reason</p>
                  <p className="text-gray-300 text-sm">{world.endReason}</p>
                </div>
              )}
              {world.finalMessage && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">Final Message</p>
                  <p className="text-gray-300 text-sm italic">
                    &ldquo;{world.finalMessage}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Memories Timeline */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Memories</h2>

          {memories.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No memories recorded yet.
            </p>
          ) : (
            <div className="relative border-l-2 border-gray-800 ml-3 pl-6 space-y-6">
              {memories.map((memory) => (
                <div key={memory._id} className="relative group">
                  <div className="absolute -left-[33px] top-1 w-3 h-3 rounded-full bg-gray-700 border-2 border-gray-900 group-hover:bg-emerald-500 transition-colors" />

                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="text-white font-medium">
                        {memory.title}
                      </h3>
                      <span
                        className={`inline-block px-2 py-0.5 border rounded text-xs capitalize ${
                          CATEGORY_COLORS[memory.category] ||
                          "bg-gray-500/10 border-gray-500/30 text-gray-400"
                        }`}
                      >
                        {memory.category}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                      {formatDate(memory.memoryDate)}
                    </p>

                    {memory.description && (
                      <p className="text-sm text-gray-400 mb-3">
                        {memory.description}
                      </p>
                    )}

                    {memory.imageUrl && (
                      <img
                        src={memory.imageUrl}
                        alt={memory.title}
                        className="w-full max-h-64 object-cover rounded-lg border border-gray-700"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
