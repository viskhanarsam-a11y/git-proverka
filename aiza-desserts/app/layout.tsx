import type { Metadata } from "next";
import { CandlestickBackground } from "./components/CandlestickBackground";
import { CoinOrbsBackground } from "./components/CoinOrbsBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crypto Motion Background",
  description: "Minimal landing page with animated candlestick background.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body className="min-h-full bg-[#020617] text-white">
        <CandlestickBackground />
        <CoinOrbsBackground />
        <div className="relative z-10 flex min-h-full flex-col">{children}</div>
      </body>
    </html>
  );
}
