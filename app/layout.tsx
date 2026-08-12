import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://raam-label.com"),
  title: "RAAM | Room All About Music",
  description:
    "RAAM is a multi-disciplinary electronic music label and creative hub in Azerbaijan.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://raam-label.com",
    siteName: "RAAM — Room All About Music",
    title: "RAAM | Room All About Music",
    description:
      "A premium electronic music community, label, and creative hub shaping local talent and immersive formats.",
    images: ["/assets/images/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: "RAAM",
  alternateName: "Room All About Music",
  url: "https://raam-label.com",
  logo: "https://raam-label.com/assets/images/logo.png",
  description:
    "A multi-disciplinary music label and creative hub dedicated to the strategic development of electronic music in Azerbaijan.",
  email: "roomallaboutmusic@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Baku",
    addressCountry: "AZ",
  },
  sameAs: [
    "https://www.youtube.com/@RAAMLabel",
    "https://linktr.ee/raamlabel",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="relative h-full antialiased">
      <body className="min-h-full bg-[#080706] text-stone-50">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
