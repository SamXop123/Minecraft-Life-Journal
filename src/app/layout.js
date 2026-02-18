import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Minecraft Life Journal",
  description: "A Minecraft Life Journal application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-950 text-white min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
