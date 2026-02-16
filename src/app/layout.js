import "./globals.css";

export const metadata = {
  title: "Minecraft Life Journal",
  description: "A Minecraft Life Journal application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
