import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "八幡平紅葉情報 | 岩手県八幡平市の美しい紅葉を発信",
  description:
    "八幡平アスピーテライン、岩手山焼走り溶岩流、三ツ石山など、八幡平市の美しい紅葉スポットの最新情報をお届けします。",
  keywords: "八幡平,紅葉,秋,観光,岩手県,アスピーテライン,三ツ石山,松川渓谷",
  openGraph: {
    title: "八幡平紅葉情報",
    description: "八幡平市の美しい紅葉スポットの最新情報",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
