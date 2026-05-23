import type { Metadata } from "next";
import Script from "next/script";
import { MotionConfig } from "framer-motion";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://raamlabel.com"),
  title: "RAAM | Room All About Music",
  description:
    "RAAM is a multi-disciplinary electronic music label and creative hub in Azerbaijan.",
  openGraph: {
    title: "RAAM | Room All About Music",
    description:
      "A premium electronic music community, label, and creative hub shaping local talent and immersive formats.",
    images: ["/assets/images/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="relative h-full antialiased">
      <head>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full bg-[#080706] text-stone-50">
        <MotionConfig reducedMotion="user">
          <a
            href="#main-content"
            className="fixed left-4 top-4 z-[100] -translate-y-20 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition focus:translate-y-0"
          >
            Skip to content
          </a>
          {children}
        </MotionConfig>
      </body>
    </html>
  );
}
