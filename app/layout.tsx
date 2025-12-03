import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PerformanceMonitor from "./components/PerformanceMonitor";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only preload the primary font
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <ClerkProvider>
        <PerformanceMonitor />
        {children}
       </ClerkProvider>
      </body>
    </html>
  );
}
