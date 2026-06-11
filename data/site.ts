import {
  GraduationCap,
  Headphones,
  RadioTower,
  Sparkles,
} from "lucide-react";
import type { Capability, ContactLink } from "@/types/content";

export const siteConfig = {
  name: "RAAM",
  expandedName: "Room All About Music",
  description:
    "A multi-disciplinary music label and creative hub dedicated to the strategic development of electronic music in Azerbaijan.",
    tagline: "Sound, ambiance, and visual narrative for the next local wave.",
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
