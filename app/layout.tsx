import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PerformanceMonitor from "./components/PerformanceMonitor";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "./components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  title: "Sovryn MVP - DeFi Platform",
  description: "A high-performance DeFi platform built with Next.js",
  keywords: ["DeFi", "Sovryn", "Bitcoin", "DeFi Platform"],
  authors: [{ name: "Sovryn Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Sovryn MVP - DeFi Platform",
    description: "A high-performance DeFi platform built with Next.js",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ClerkProvider>
          <ThemeProvider>
            <PerformanceMonitor />
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
