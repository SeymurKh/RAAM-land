import type { Metadata } from "next";
import { VenuePageShell } from "@/components/VenuePageShell";

const title = "Radio Stream Bar | RAAM";
const description =
  "Radio Stream Bar by RAAM Label — Azerbaijan's first live streaming space for artists. Live broadcasts, music events, and a bar in the heart of Baku.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/radio-stream-bar",
  },
  openGraph: {
    type: "website",
    url: "https://raam-label.com/radio-stream-bar",
    siteName: "RAAM — Room All About Music",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BarOrPub",
  name: "Radio Stream Bar",
  alternateName: "Radio Stream Bar by RAAM Label",
  url: "https://raam-label.com/radio-stream-bar",
  description,
  telephone: "+994 993 01 00 69",
  address: {
    "@type": "PostalAddress",
    streetAddress: "17 Tarlan Aliyarbeyov st.",
    addressLocality: "Baku",
    addressCountry: "AZ",
  },
  parentOrganization: {
    "@type": "MusicGroup",
    name: "RAAM",
    url: "https://raam-label.com",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Thursday", "Friday", "Saturday", "Sunday"],
      opens: "20:00",
      closes: "04:00",
    },
  ],
};

export default function RadioStreamBarPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VenuePageShell />
    </>
  );
}