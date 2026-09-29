import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AudioPlayerProvider } from "@/components/audio/AudioPlayerContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kyambogo Radio 107.4 FM | The Voice of Kyambogo University",
    template: "%s | Kyambogo Radio 107.4 FM",
  },
  description:
    "Listen live to Kyambogo University Online Radio (107.4 FM). Student news, campus shows, sports, technology, and university broadcasts.",
  keywords: [
    "Kyambogo Radio",
    "Kyambogo University",
    "Campus Radio Uganda",
    "107.4 FM",
    "University Online Radio",
    "Student Radio Kampala",
  ],
  authors: [{ name: "Kyambogo University Media & ICT" }],
  creator: "Kyambogo University Radio",
  publisher: "Kyambogo University",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_UG",
    url: "https://radio.kyu.ac.ug",
    siteName: "Kyambogo Radio 107.4 FM",
    title: "Kyambogo Radio 107.4 FM | The Voice of Kyambogo University",
    description:
      "Listen live to Kyambogo University Online Radio. Stream live campus shows, request songs, and access recorded podcasts.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&h=630&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Kyambogo Radio Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kyambogo Radio 107.4 FM",
    description: "The Voice of Kyambogo University - Live on 107.4 FM & Online",
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
    <html lang="en" className={inter.variable}>
      <body className="bg-navy-900 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-radio-500/30 selection:text-white">
        <AudioPlayerProvider>
          {children}
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
