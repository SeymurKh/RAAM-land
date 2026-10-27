import type { VenuePageContent } from "@/types/content";

/**
 * Сид страницы Radio Stream Bar.
 * Тексты — из утверждённого макета; картинки (лого, hero, фото)
 * загружаются через админку (/admin/venue) и дописываются в db.json.
 */
export const seedVenue: VenuePageContent = {
  name: "Radio Stream Bar",
  byLabel: "[ BY RAAM LABEL ]",
  headline: "Azerbaijan's first live streaming space for artists.",
  tags: ["Streaming", "Music", "Events"],
  slogan: "One space. Multiple frequencies.",
  live: {
    eyebrow: "Live Streaming",
    title: "Live streaming from Baku. Broadcasting worldwide.",
    description: [
      "Every DJ set from our Thursday to Saturday lineup is streamed live across:",
    ],
    platforms: [
      {
        kind: "youtube",
        label: "YouTube",
        url: "https://www.youtube.com/@RAAMLabel",
      },
      { kind: "twitch", label: "Twitch", url: "https://www.twitch.tv/raamlabel" },
      {
        kind: "instagram",
        label: "Instagram",
        url: "https://www.instagram.com/raam.label/",
      },
      {
        kind: "mixcloud",
        label: "Mixcloud",
        url: "https://www.mixcloud.com/raamlabel/",
      },
    ],
    note: "Catch the stream on our in-house screen while you're here.",
    cta: {
      label: "Watch our streams",
      href: "https://www.youtube.com/@RAAMLabel",
    },
    liveBadge: true,
  },
  events: {
    eyebrow: "Events",
    title: "A space for music events.",
    description: [
      "A space for different kinds of music events — from DJ sets and live performances to exclusive private events.",
    ],
    manifesto: ["No genre limits.", "No language barriers.", "Only music."],
    cta: {
      label: "See upcoming events",
      href: "https://www.instagram.com/raam.label/",
    },
    gallery: [],
  },
  bar: {
    eyebrow: "The Bar",
    title: "The bar is part of the experience.",
    description: [
      "Our bartender is one more reason to rewatch the stream you were part of.",
    ],
    images: [],
    // Пример структуры меню — заменяется через админку (/admin/venue)
    menu: [
      {
        id: "cocktails",
        title: "Cocktails",
        order: 1,
        items: [
          {
            id: "negroni",
            name: "Negroni",
            description: "Classic bitter & balanced",
            price: "12 AZN",
            order: 1,
          },
          {
            id: "aperol-spritz",
            name: "Aperol Spritz",
            description: "Bright, sparkling, refreshing",
            price: "10 AZN",
            order: 2,
          },
        ],
      },
    ],
  },
  contacts: {
    address: "17 Tarlan Aliyarbeyov st., Baku, Azerbaijan",
    phone: "+994 993 01 00 69",
    phoneHref: "tel:+994993010069",
    hours: "Thu, Fri, Sat, Sun · 20:00–04:00",
  },
};
