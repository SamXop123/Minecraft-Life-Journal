import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { title, description, contact, worldName, appVersion, os } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required." },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.DISCORD_BUG_WEBHOOK;

    if (webhookUrl) {
      const payload = {
        username: "MLJ Companion Bug Reporter",
        avatar_url: "https://minecraft-life-journal.vercel.app/logo.png",
        embeds: [
          {
            title: `🐛 Bug Report: ${title}`,
            description: description,
            color: 15158332, // Red/Orange tint
            fields: [
              { name: "App Version", value: appVersion || "v2.0.0", inline: true },
              { name: "OS", value: os || "Windows", inline: true },
              { name: "Reporter", value: contact || "Anonymous", inline: true },
              { name: "Selected World", value: worldName || "None", inline: false },
            ],
            footer: {
              text: "Minecraft Life Journal Companion",
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((err) => console.error("Discord Webhook Error:", err));
    } else {
      console.log("Bug report received (DISCORD_BUG_WEBHOOK not set):", {
        title,
        description,
        contact,
        worldName,
        appVersion,
        os,
      });
    }

    return NextResponse.json(
      { message: "Bug report submitted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bug report endpoint error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
