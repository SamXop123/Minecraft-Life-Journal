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

    if (!webhookUrl) {
      console.error("DISCORD_BUG_WEBHOOK environment variable is not set.");
      return NextResponse.json(
        { message: "Server DISCORD_BUG_WEBHOOK environment variable is not set." },
        { status: 500 }
      );
    }

    const payload = {
      username: "MLJ Companion Bug Reporter",
      avatar_url: "https://mlj.app/logo.png",
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
            text: "Minecraft Life Journal Companion v2.0.0",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (discordRes.ok || discordRes.status === 204) {
      return NextResponse.json(
        { message: "Bug report submitted successfully." },
        { status: 200 }
      );
    } else {
      const errText = await discordRes.text();
      console.error("Discord Webhook Error:", discordRes.status, errText);
      return NextResponse.json(
        { message: `Discord API error: ${discordRes.status}` },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Bug report endpoint error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
