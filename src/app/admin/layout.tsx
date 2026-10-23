import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./admin.css";

const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-plex",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Admin · Amouna Cuisine",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#f6f5f2" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${plex.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
