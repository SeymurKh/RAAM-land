import type { Project } from "@/types/content";

export const seedProjects: Project[] = [
  {
    id: "raam-fomo",
    title: "RAAM x FOMO",
    category: "Collaboration",
    status: "Active",
    accent: "Club / Interviews / Video Sets",
    order: 1,
    youtubeUrl:
      "https://www.youtube.com/playlist?list=PLXMe8QzaK6KR5z3A3WtLCXzsGmX8WvWQh",
    description: [
      "A collaborative platform for RAAM residents at FOMO Baku, one of Azerbaijan's most known clubs.",
      "The format brings together artist interviews, venue insight, and full video sets for YouTube release.",
    ],
  },
  {
    id: "uptempo-jams",
    title: "UpTempo Jams",
    category: "Audio Visual Series",
    status: "Active",
    accent: "High BPM / Visual Production",
    order: 2,
    youtubeUrl:
      "https://www.youtube.com/playlist?list=PLXMe8QzaK6KTjYTv9sNTbJqtszfohb7B5",
    description: [
      "A high-BPM electronic music format recorded at Finestra del Aperitivo.",
      "The series highlights residents, wider community artists, and graduates ready to present their sound.",
    ],
  },
  {
    id: "raam-live",
    title: "RAAM LIVE",
    category: "Audio Series",
    status: "Active",
    accent: "Real-time DJ Performances",
    order: 3,
    youtubeUrl:
      "https://youtube.com/playlist?list=PLXMe8QzaK6KSM-Hjia_RE5euiS75RXDao&si=oJYYS4ECGlviSxad",
    description: [
      "Audio sets recorded directly during live performances in RAAM venues.",
      "Each release documents the flow, energy, and atmosphere of the night as it actually happened.",
    ],
  },
  {
    id: "cassette-series",
    title: "RAAM Cassette",
    category: "Audio Visual Series",
    status: "Active",
    accent: "Intimate Sets / Vinyl Aesthetic",
    order: 4,
    youtubeUrl:
      "https://youtube.com/playlist?list=PLXMe8QzaK6KSV0OBvj_fOEoq8PPbsltA2&si=ehU1mjUECC4KBGgd",
    description: [
      "An intimate audio-visual format recorded in close settings with a warm, analog aesthetic.",
      "Each episode captures a resident in a focused, personal set: raw sound, real atmosphere.",
    ],
  },
];
