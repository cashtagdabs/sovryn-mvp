import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PerformanceMonitor from "./components/PerformanceMonitor";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "./components/ThemeProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
  const hasValidClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_live_') || 
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_') && 
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 20;

  const content = (
    <ThemeProvider>
      <PerformanceMonitor />
      {children}
    </ThemeProvider>
  );

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {hasValidClerkKey ? (
          <ClerkProvider>{content}</ClerkProvider>
        ) : (
          content
        )}
        <SpeedInsights />
      </body>
    </html>
  );
}
