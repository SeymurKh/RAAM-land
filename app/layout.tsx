import type { Metadata } from "next";
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
    images: ["/assets/images/dj-turntable-hero.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#080706] text-stone-50">{children}</body>
    </html>
  );
}
