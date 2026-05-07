import {
  GraduationCap,
  Headphones,
  RadioTower,
  Sparkles,
} from "lucide-react";
import type { Artist, Capability, ContactLink, Project } from "@/types/content";

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

export const artists: Artist[] = [
  {
    id: "pedro",
    name: "Pedro",
    origin: "PT",
    role: "Resident DJ",
    genres: ["House", "Deep House", "Tech House", "Indie Dance"],
    bio: [
      "Hailing from Portugal, Pedro is a passionate selector, moving between deep house, funky house, minimal, and tech house with ease.",
      "His journey began in the 90s as a light jockey in a club, where the DJs behind the decks sparked a lifelong dedication to music.",
      "With over 20 years on stage, Pedro has performed at iconic European venues, shaping dancefloors with groove, rhythm, and emotion.",
    ],
    highlights: [
      "Over 20 years on stage",
      "Deep European club culture",
      "Dedicated digger and selector",
    ],
    portfolio: [
      { id: "pedro-grape", title: "Pedro at Grape Grooves", kind: "video" },
      { id: "pedro-shayyo", title: "Pedro b2b Shayyo at 4Loft", kind: "audio" },
    ],
    socials: [
      {
        kind: "instagram",
        label: "@pedro.raam",
        url: "https://www.instagram.com/pedro.raam",
      },
      {
        kind: "soundcloud",
        label: "Pedro on SoundCloud",
        url: "https://soundcloud.com/search?q=Pedro%20RAAM",
      },
    ],
    visual: { initials: "PD", position: "high", tone: "from-stone-300/20" },
  },
  {
    id: "boraa",
    name: "Boraa",
    origin: "CA",
    role: "DJ / Producer",
    genres: ["Deep Progressive", "Deep Hypnotic", "Melodic House", "Organic House"],
    bio: [
      "Boraa is one of the key figures behind the modern DJ scene in Azerbaijan, contributing to the sound and development of leading venues.",
      "With nearly two decades in electronic music, he has performed in Istanbul, Los Angeles, Baku, and several cities across Canada.",
      "Alongside his DJ career, Boraa produces progressive and organic house material that has helped define his artistic identity.",
    ],
    highlights: [
      "Shared stages with Guy J and Jody Wisternoff",
      "International performances",
      "Latest release: Frozen Memories EP",
    ],
    portfolio: [
      { id: "boraa-chirag", title: "Boraa at Chirag Gala", kind: "video" },
      { id: "boraa-schirm", title: "Boraa at Schirmchendrink", kind: "audio" },
    ],
    socials: [
      {
        kind: "instagram",
        label: "@boraamusic",
        url: "https://www.instagram.com/boraamusic",
      },
      {
        kind: "spotify",
        label: "Boraa on Spotify",
        url: "https://open.spotify.com/search/Boraa",
      },
      {
        kind: "soundcloud",
        label: "Boraa on SoundCloud",
        url: "https://soundcloud.com/search?q=Boraa",
      },
    ],
    visual: { initials: "BR", position: "middle", tone: "from-zinc-100/20" },
  },
  {
    id: "farik-interlude",
    name: "Farik Interlude",
    origin: "AZ",
    role: "Resident DJ",
    genres: ["Melodic House & Techno", "Indie Dance", "House", "Afro House"],
    bio: [
      "Farik Interlude is a local DJ and one of the pioneers shaping early DJ culture at RAAM venues.",
      "Known for a distinctive and recognizable style, he has become a consistent presence in the local electronic scene.",
      "He is currently focused on developing his music production practice and preparing original tracks for release.",
    ],
    highlights: [
      "Almost seven years behind the decks",
      "Shared stages with Elif, Djolee, and Alican",
      "Original productions in development",
    ],
    portfolio: [
      { id: "farik-grape", title: "Farik at Grape Grooves", kind: "video" },
      { id: "farik-afro", title: "Farik's Afro House Set", kind: "audio" },
    ],
    socials: [
      {
        kind: "instagram",
        label: "@farik_interlude",
        url: "https://www.instagram.com/farik_interlude",
      },
      {
        kind: "soundcloud",
        label: "Farik on SoundCloud",
        url: "https://soundcloud.com/search?q=Farik%20Interlude",
      },
    ],
    visual: { initials: "FI", position: "low", tone: "from-neutral-200/20" },
  },
  {
    id: "shayyo",
    name: "Shayyo",
    origin: "AZ",
    role: "Resident DJ / Mentor",
    genres: ["Tech House", "Indie Dance", "Melodic House", "Downtempo"],
    bio: [
      "Shayyo is a local DJ and one of the pioneers shaping the sound at RAAM venues, known for versatile and engaging sets.",
      "Over the years, he has shared stages with Secret Factory, Fel C, Kimonos, and Rafael.",
      "With nearly a decade of production experience, Shayyo also mentors emerging talent in RAAM's coaching program.",
    ],
    highlights: [
      "Nearly 10 years in music production",
      "Mentor in the coaching program",
      "Resident of RAAM Live and Cassette formats",
    ],
    portfolio: [
      { id: "shayyo-grape", title: "Shayyo at Grape Grooves", kind: "video" },
      { id: "shayyo-cassette", title: "Shayyo at Cassette", kind: "video" },
      { id: "shayyo-live", title: "Shayyo at RAAM Live", kind: "audio" },
    ],
    socials: [
      {
        kind: "instagram",
        label: "@shayohigh",
        url: "https://www.instagram.com/shayohigh",
      },
      {
        kind: "soundcloud",
        label: "Shayyo on SoundCloud",
        url: "https://soundcloud.com/search?q=Shayyo",
      },
    ],
    visual: { initials: "SH", position: "high", tone: "from-stone-400/20" },
  },
  {
    id: "inmysoul",
    name: "Inmysoul",
    origin: "AZ",
    role: "DJ / Producer",
    genres: ["House", "Deep House", "UK Garage", "Fast Groove"],
    bio: [
      "Inmysoul is a local DJ and producer with 9 years of music production experience and nearly 5 years of live performances.",
      "After a recent debut at FOMO, sharing the stage with Yaya Tamango, he has become a dynamic voice in the local scene.",
      "His recorded videoset in Tbilisi highlights a precise, energetic, and versatile approach to performance.",
    ],
    highlights: [
      "9 years of production experience",
      "Nearly 5 years performing live",
      "Latest release: The Path single",
    ],
    portfolio: [
      { id: "inmysoul-hor", title: "Inmysoul for Berlin HOR", kind: "audio" },
      { id: "inmysoul-uptempo", title: "Inmysoul at UpTempo Jams", kind: "video" },
      { id: "inmysoul-deep", title: "Inmysoul's Deep House Set", kind: "audio" },
    ],
    socials: [
      {
        kind: "instagram",
        label: "inmysoulsky",
        url: "https://www.instagram.com/inmysoulsky",
      },
      {
        kind: "spotify",
        label: "Inmysoul on Spotify",
        url: "https://open.spotify.com/search/Inmysoul",
      },
      {
        kind: "soundcloud",
        label: "Inmysoul on SoundCloud",
        url: "https://soundcloud.com/search?q=Inmysoul",
      },
    ],
    visual: { initials: "IS", position: "middle", tone: "from-zinc-300/20" },
  },
];

export const projects: Project[] = [
  {
    id: "raam-fomo",
    title: "RAAM x FOMO",
    category: "Collaboration",
    status: "Developing",
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
    status: "Archive",
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
    status: "Developing",
    accent: "DJing / Production",
    column: 4,
    description: [
      "Group and individual DJ sessions build technical and creative foundations for new artists.",
      "The production program guides each participant toward an original track and potential label support.",
    ],
  },
];

export const contactLinks: ContactLink[] = [
  {
    id: "linktree",
    label: "Linktree",
    value: "linktr.ee/raamlabel",
    href: "https://linktr.ee/raamlabel",
    kind: "linktree",
  },
  {
    id: "email",
    label: "Email",
    value: "roomallaboutmusic@gmail.com",
    href: "mailto:roomallaboutmusic@gmail.com",
    kind: "email",
  },
  {
    id: "phone",
    label: "Phone",
    value: "+994 993 01 00 69",
    href: "tel:+994993010069",
    kind: "phone",
  },
];
