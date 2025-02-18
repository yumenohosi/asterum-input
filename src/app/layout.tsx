import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { customFont } from '@/styles/fonts'
import { FontProvider } from '@/contexts/FontContext';
import { Analytics } from "@vercel/analytics/react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "아스테룸어 변환기",
  description: "한글을 아스테룸어로 변환하는 도구입니다.",
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        url: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    apple: {
      url: '/web-app-manifest-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
  },
  openGraph: {
    title: '아스테룸어 변환기',
    description: '한글을 아스테룸어로 변환하는 도구입니다.',
    images: [
      {
        url: '/web-app-manifest-512x512.png', 
        width: 512,
        height: 512,
        alt: '아스테룸어 변환기',
      },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} ${customFont.variable} antialiased`}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <FontProvider>
        <body>{children}</body>
      </FontProvider>
      <Analytics />
    </html>
  );
}
