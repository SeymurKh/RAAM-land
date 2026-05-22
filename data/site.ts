import {
  GraduationCap,
  Headphones,
  RadioTower,
  Sparkles,
} from "lucide-react";
import type { Capability, ContactLink, Project } from "@/types/content";

export const siteConfig = {
  name: "RAAM",
  expandedName: "Room All About Music",
  description:
    "A multi-disciplinary music label and creative hub dedicated to the strategic development of electronic music in Azerbaijan.",
  tagline: "Sound, ambiance, and visual narrative for the next local wave.",
  heroImage: "/assets/images/dj-turntable-hero.jpg",
  sourceMaterials: [
    "assets/source/RAAM PRESENTS.pdf",
    "assets/source/RAAM RESIDENTS.pdf",
  ],
};

export const capabilities: Capability[] = [
  {
    id: "booking",
    title: "Booking",
    description:
      "Connecting residents with premium venues and cultural spaces through carefully shaped live performance opportunities.",
    icon: Headphones,
  },
  {
    id: "media",
    title: "Media Production",
    description:
      "Filming DJ sets, producing audiovisual formats, and collaborating with leading clubs and cultural venues.",
    icon: RadioTower,
  },
  {
    id: "label",
    title: "Label & Promotion",
    description:
      "Supporting resident artists with music promotion, career development, and a stronger public presence.",
    icon: Sparkles,
  },
  {
    id: "coaching",
    title: "Coaching & Education",
    description:
      "Developing DJ and music production programs that help emerging artists take their first steps.",
    icon: GraduationCap,
  },
];

export const projects: Project[] = [
  {
    id: "raam-fomo",
    title: "RAAM x FOMO",
    category: "Collaboration",
    status: "Active",
    accent: "Club / Interviews / Video Sets",
    column: 1,
    description: [
      "A collaborative platform for RAAM residents at FOMO Baku, one of Azerbaijan's most known clubs.",
      "The first stage includes artist interviews, venue insight, and two full video sets for YouTube release.",
    ],
  },
  {
    id: "uptempo-jams",
    title: "UpTempo Jams",
    category: "Audio Visual Series",
    status: "Active",
    accent: "High BPM / Visual Production",
    column: 2,
    description: [
      "A high-BPM electronic music format recorded at Finestra del Aperitivo.",
      "The series highlights residents, wider community artists, and coaching graduates ready to present their sound.",
    ],
    media: { label: "Watch sessions" },
  },
  {
    id: "raam-live",
    title: "RAAM Live",
    category: "Audio Series",
    status: "Active",
    accent: "Real-time DJ Performances",
    column: 3,
    description: [
      "Audio sets recorded directly during live performances in RAAM venues.",
      "Each release documents the flow, energy, and atmosphere of the night as it actually happened.",
    ],
  },
  {
    id: "coaching",
    title: "Coaching Programs",
    category: "Education",
    status: "Active",
    accent: "DJing / Production",
    column: 4,
    description: [
      "Group and individual DJ sessions build technical and creative foundations for new artists.",
      "The production program guides each participant toward an original track and potential label support.",
    ],
  },
  {
    id: "cassette-series",
    title: "Cassette Series",
    category: "Audio Visual Series",
    status: "Active",
    accent: "Intimate Sets / Vinyl Aesthetic",
    column: 5,
    description: [
      "An intimate audio-visual format recorded in close settings with a warm, analog aesthetic.",
      "Each episode captures a resident in a focused, personal set — raw sound, real atmosphere.",
    ],
  },
];

export const contactLinks: ContactLink[] = [
  {
    id: "phone",
    label: "Phone",
    value: "+994 993 01 00 69",
    href: "tel:+994993010069",
    kind: "phone",
  },
  {
    id: "email",
    label: "Email",
    value: "roomallaboutmusic@gmail.com",
    href: "mailto:roomallaboutmusic@gmail.com",
    kind: "email",
  },
  {
    id: "linktree",
    label: "Linktree",
    value: "linktr.ee/raamlabel",
    href: "https://linktr.ee/raamlabel",
    kind: "linktree",
  },
];
