import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Akinola Samuel Toluwani — EKSU SU Financial Secretary",
  description:
    "Capacity. Integrity. Real Impact. Official campaign platform of Akinola Samuel Toluwani for EKSU Students' Union Financial Secretary — GPA/CGPA calculator, live transport prices, and more.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#12301F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plex.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
