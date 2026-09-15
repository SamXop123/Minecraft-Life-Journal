/**
 * Intelligent Memory Categorizer for Minecraft Life Journal
 * Parses explicit user tags like `[build]` or `#build`, and uses semantic keyword matching
 * to classify memories naturally into the right category instead of defaulting to "achievement".
 */

export const PRESET_CATEGORIES = [
  "achievement",
  "build",
  "exploration",
  "mining",
  "combat",
  "death",
  "redstone",
  "story",
  "funny",
  "emotional",
];

/**
 * Classify a memory text into an appropriate category.
 * @param {string} text - The journal message or description.
 * @param {string} [title=""] - Optional title.
 * @returns {{ category: string, cleanText: string }}
 */
export function classifyMemory(text = "", title = "") {
  const combined = `${title} ${text}`.trim();
  if (!combined) {
    return { category: "story", cleanText: text };
  }

  // 1. Check for explicit bracket tags like `[build]`, `[mining]`, `[custom_tag]`
  const bracketMatch = text.match(/^\s*\[([a-zA-Z0-9_\-\s]{2,20})\]\s*(.*)$/);
  if (bracketMatch) {
    const customTag = bracketMatch[1].trim().toLowerCase();
    const remainingText = bracketMatch[2].trim();
    return {
      category: customTag,
      cleanText: remainingText || text,
    };
  }

  // 2. Check for parenthesized tags like `(build) Made a tower`
  const parenMatch = text.match(/^\s*\(([a-zA-Z0-9_\-\s]{2,20})\)\s*(.*)$/);
  if (parenMatch) {
    const customTag = parenMatch[1].trim().toLowerCase();
    const remainingText = parenMatch[2].trim();
    return {
      category: customTag,
      cleanText: remainingText || text,
    };
  }

  // 3. Keyword-based classification
  const lower = combined.toLowerCase();
  const lowerWithoutGame = lower.replace(/minecraft/g, "");

  // Death
  if (
    lower.includes("died") ||
    lower.includes("death") ||
    lower.includes("killed by") ||
    lower.includes("slain by") ||
    lower.includes("fell from") ||
    lower.includes("drowned") ||
    lower.includes("burned") ||
    lower.includes("lava") ||
    lower.includes("blown up") ||
    lower.includes("creeper exploded") ||
    lower.includes("suffocated") ||
    lower.includes("perished") ||
    lower.includes("grave") ||
    lower.includes("rip")
  ) {
    return { category: "death", cleanText: text };
  }

  // Combat / Boss Fights
  if (
    lower.includes("dragon") ||
    lower.includes("wither") ||
    lower.includes("warden") ||
    lower.includes("elder guardian") ||
    lower.includes("raid") ||
    lower.includes("pillager") ||
    lower.includes("evoker") ||
    lower.includes("ravager") ||
    lower.includes("fight") ||
    lower.includes("battle") ||
    lower.includes("boss") ||
    lower.includes("pvp") ||
    lower.includes("slain") ||
    lower.includes("mob") ||
    lower.includes("defeated") ||
    lower.includes("victory")
  ) {
    return { category: "combat", cleanText: text };
  }

  // Mining / Ores
  if (
    lower.includes("diamond") ||
    lower.includes("diamonds") ||
    lower.includes("netherite") ||
    lower.includes("ancient debris") ||
    lower.includes("iron") ||
    lower.includes("gold") ||
    lower.includes("emerald") ||
    lower.includes("lapis") ||
    lower.includes("deepslate") ||
    lower.includes("ore") ||
    lower.includes("cave") ||
    lower.includes("caving") ||
    lower.includes("spelunking") ||
    lower.includes("strip mine") ||
    lowerWithoutGame.includes("mine") ||
    lowerWithoutGame.includes("mining") ||
    lower.includes("geode") ||
    lower.includes("amethyst") ||
    lower.includes("y=-58") ||
    lower.includes("shaft")
  ) {
    return { category: "mining", cleanText: text };
  }

  // Building & Bases
  if (
    lower.includes("build") ||
    lower.includes("built") ||
    lower.includes("building") ||
    lower.includes("house") ||
    lower.includes("base") ||
    lower.includes("castle") ||
    lower.includes("tower") ||
    lower.includes("farm") ||
    lower.includes("barn") ||
    lower.includes("roof") ||
    lower.includes("wall") ||
    lower.includes("bridge") ||
    lower.includes("interior") ||
    lower.includes("decoration") ||
    lower.includes("palace") ||
    lower.includes("monument") ||
    lower.includes("storage") ||
    lower.includes("windmill") ||
    lower.includes("lighthouse") ||
    lower.includes("dock")
  ) {
    return { category: "build", cleanText: text };
  }

  // Exploration & World Structures
  if (
    lower.includes("found") ||
    lower.includes("discovered") ||
    lower.includes("explore") ||
    lower.includes("exploring") ||
    lower.includes("biome") ||
    lower.includes("mansion") ||
    lower.includes("stronghold") ||
    lower.includes("ocean monument") ||
    lower.includes("trail ruins") ||
    lower.includes("trial chamber") ||
    lower.includes("ancient city") ||
    lower.includes("village") ||
    lower.includes("shipwreck") ||
    lower.includes("structure") ||
    lower.includes("temple") ||
    lower.includes("pyramid") ||
    lower.includes("elytra") ||
    lower.includes("flew") ||
    lower.includes("portal") ||
    lower.includes("travel") ||
    lower.includes("journey") ||
    lower.includes("sailing") ||
    lower.includes("map")
  ) {
    return { category: "exploration", cleanText: text };
  }

  // Redstone & Automation
  if (
    lower.includes("redstone") ||
    lower.includes("contraption") ||
    lower.includes("automated") ||
    lower.includes("sorter") ||
    lower.includes("piston") ||
    lower.includes("repeater") ||
    lower.includes("comparator") ||
    lower.includes("flying machine") ||
    lower.includes("clock") ||
    lower.includes("hopper") ||
    lower.includes("dispenser") ||
    lower.includes("circuit")
  ) {
    return { category: "redstone", cleanText: text };
  }

  // Funny
  if (
    lower.includes("lol") ||
    lower.includes("lmao") ||
    lower.includes("haha") ||
    lower.includes("funny") ||
    lower.includes("derp") ||
    lower.includes("oops") ||
    lower.includes("fail") ||
    lower.includes("joke") ||
    lower.includes("troll") ||
    lower.includes("accident") ||
    lower.includes("silly")
  ) {
    return { category: "funny", cleanText: text };
  }

  // Emotional & Pets
  if (
    lower.includes("love") ||
    lower.includes("sad") ||
    lower.includes("emotional") ||
    lower.includes("peaceful") ||
    lower.includes("sunset") ||
    lower.includes("memories") ||
    lower.includes("remember") ||
    lower.includes("goodbye") ||
    lower.includes("miss") ||
    lower.includes("nostalgia") ||
    lower.includes("wholesome") ||
    lower.includes("pet") ||
    lower.includes("dog") ||
    lower.includes("cat") ||
    lower.includes("wolf") ||
    lower.includes("horse") ||
    lower.includes("tamed")
  ) {
    return { category: "emotional", cleanText: text };
  }

  // Explicit Achievements & Milestones
  if (
    lower.includes("advancement") ||
    lower.includes("achievement") ||
    lower.includes("unlocked") ||
    lower.includes("milestone") ||
    lower.includes("100 days") ||
    lower.includes("completed goal")
  ) {
    return { category: "achievement", cleanText: text };
  }

  // Default fallback is Story & Lore (natural journal entry)
  return { category: "story", cleanText: text };
}
