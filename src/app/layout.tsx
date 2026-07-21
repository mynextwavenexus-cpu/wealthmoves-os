import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/client-layout";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "WealthMoves OS - AI-Powered Revenue Operating System",
    template: "%s | WealthMoves OS",
  },
  description: "Achieve financial freedom with WealthMoves OS. AI-powered revenue coaching, dream life blueprinting, 30-day revenue sprints, and done-with-you systems. Turn your dream lifestyle into an executable income plan.",
  keywords: ["revenue coaching", "AI business coach", "financial freedom", "income planning", "revenue sprint", "business systems", "wealth building", "entrepreneur tools"],
  authors: [{ name: "Emma Jackson" }],
  creator: "WealthMoves",
  publisher: "WealthMoves",
  metadataBase: new URL("https://wealthmoves-os.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wealthmoves-os.vercel.app",
    siteName: "WealthMoves OS",
    title: "WealthMoves OS - AI-Powered Revenue Operating System",
    description: "Achieve financial freedom with AI-powered revenue coaching. Dream life blueprinting, 30-day sprints, and done-with-you systems.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WealthMoves OS - Turn Your Dream Life Into Reality",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WealthMoves OS - AI-Powered Revenue Operating System",
    description: "Achieve financial freedom with AI-powered revenue coaching. Dream life blueprinting, 30-day sprints, and done-with-you systems.",
    images: ["/og-image.png"],
    creator: "@wealthmoves",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // Replace with actual code when available
  },
  category: "Business Software",
};

export const viewport: Viewport = {
  themeColor: "#0F3F4C",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
