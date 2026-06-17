import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "StallPulse — F&B Location Intelligence",
  description:
    "Data-driven hawker centre viability scores for Singapore F&B entrepreneurs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`}
    >
      <body className="min-h-full flex flex-col font-sans text-slate-900 bg-white">
        <nav className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="font-bold text-orange-600">
              StallPulse
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/" className="text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/about" className="text-slate-600 hover:text-slate-900">
                About
              </Link>
              <a
                href="/api/locations"
                className="text-slate-600 hover:text-slate-900"
              >
                API
              </a>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          NTU Big Data Systems · StallPulse · Data from data.gov.sg (NEA, LTA)
        </footer>
      </body>
    </html>
  );
}
