import "./globals.css";
import Navbar from "@/components/Navbar";
import MusicButton from "@/components/MusicButton";
import SettingsModal from "@/components/SettingsModal";
import { SettingsProvider } from "@/context/SettingsContext";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  metadataBase: new URL("https://mlj.app"),
  title: "Minecraft Life Journal | Preserve Your Minecraft World Stories & Playtime",
  description: "Track your Minecraft adventures, in-game memories, screenshots, coordinate logs, and total playtime live with MLJ Companion.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Minecraft Life Journal | Sync Your In-Game Journey Live",
    description: "Track your Minecraft adventures, in-game memories, screenshots, coordinate logs, and total playtime live.",
    url: "https://mlj.app",
    siteName: "Minecraft Life Journal",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Minecraft Life Journal Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Minecraft Life Journal",
    description: "Track your Minecraft adventures, in-game memories, screenshots, coordinate logs, and total playtime live.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Silkscreen:wght@400;700&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-gray-950 text-white min-h-screen">
        <SettingsProvider>
          <Navbar />
          <SettingsModal />
          <MusicButton />
          <main>{children}</main>
          <Analytics />
        </SettingsProvider>
      </body>
    </html>
  );
}
