import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AudioPlayerProvider } from "@/components/audio/AudioPlayerContext";

export const metadata: Metadata = {
  title: {
    default: "UniCast | Your Campus Pulse",
    template: "%s | UniCast Radio",
  },
  description:
    "UniCast is the single online university radio platform connecting students across universities. One Radio. Every Campus. Live shows, student talk, varsity sports, and music.",
  keywords: [
    "UniCast",
    "Your Campus Pulse",
    "University Radio",
    "Campus Radio",
    "Uganda Campus Radio",
    "East Africa Student Radio",
    "Online University Radio",
    "Student Radio Station",
  ],
  authors: [{ name: "UniCast Media Network" }],
  creator: "UniCast Radio",
  publisher: "UniCast",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_UG",
    url: "https://unicast.radio",
    siteName: "UniCast — Your Campus Pulse",
    title: "UniCast | Your Campus Pulse",
    description:
      "One Radio. Every Campus. Listen live to UniCast, submit song requests, and tune in to cross-campus podcasts.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&h=630&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "UniCast Live Radio Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UniCast | Your Campus Pulse",
    description: "One Radio. Every Campus. Live student radio streaming across universities.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0F1D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-navy-900 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-radio-500/30 selection:text-white">
        <AudioPlayerProvider>
          {children}
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
