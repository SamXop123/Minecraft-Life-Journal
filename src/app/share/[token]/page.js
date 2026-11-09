import { connectDB } from "@/lib/db";
import World from "@/models/World";
import User from "@/models/User";
import SharedWorldClient from "./SharedWorldClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { token } = await params;

  try {
    await connectDB();
    const world = await World.findOne({ shareToken: token }).populate("userId", "username displayName");

    if (!world || !world.isPublic) {
      return {
        title: "Shared World Not Found | Minecraft Life Journal",
        description: "This Minecraft world is private or does not exist.",
        openGraph: {
          title: "Shared World Not Found | Minecraft Life Journal",
          description: "This Minecraft world is private or does not exist.",
          url: `https://www.mlj.app/share/${token}`,
          siteName: "Minecraft Life Journal",
          type: "website",
          images: [
            {
              url: "https://www.mlj.app/logo.png",
              width: 800,
              height: 800,
              alt: "Minecraft Life Journal",
            },
          ],
        },
      };
    }

    const creatorName = world.userId?.displayName || world.userId?.username || "A Player";
    const worldName = world.name || "Untitled World";
    const mode = world.mode ? `${world.mode.charAt(0).toUpperCase() + world.mode.slice(1)} Mode` : "Survival Mode";
    const version = world.mcVersion ? `v${world.mcVersion}` : "";

    const title = `${worldName} by ${creatorName} | Minecraft Life Journal`;
    const description = `Explore ${creatorName}'s Minecraft world "${worldName}" (${mode}${version ? `, ${version}` : ""}) on Minecraft Life Journal. Relive their journey, coordinates, and memories.`;

    const imageUrl = world.coverImage || "https://www.mlj.app/logo.png";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://www.mlj.app/share/${token}`,
        siteName: "Minecraft Life Journal",
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${worldName} cover photo`,
          },
        ],
      },
      twitter: {
        card: world.coverImage ? "summary_large_image" : "summary",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating share metadata:", error);
    return {
      title: "Minecraft Life Journal | Shared World",
      description: "Explore shared Minecraft world memories on Minecraft Life Journal.",
      openGraph: {
        title: "Minecraft Life Journal | Shared World",
        description: "Explore shared Minecraft world memories on Minecraft Life Journal.",
        url: `https://www.mlj.app/share/${token}`,
        siteName: "Minecraft Life Journal",
        type: "website",
        images: [
          {
            url: "https://www.mlj.app/logo.png",
            width: 800,
            height: 800,
            alt: "Minecraft Life Journal",
          },
        ],
      },
    };
  }
}

export default async function SharedWorldPage({ params }) {
  const { token } = await params;
  return <SharedWorldClient token={token} />;
}
