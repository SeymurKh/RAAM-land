import type { VenuePageContent } from "@/types/content";

/**
 * Сид страницы Radio Stream Bar.
 * Тексты — из утверждённого макета; картинки (лого, hero, фото)
 * загружаются через админку (/admin/venue) и дописываются в db.json.
 */
export const seedVenue: VenuePageContent = {
  name: "Radio Stream Bar",
  headline: "Azerbaijan's first live streaming space for artists.",
  tags: ["Streaming", "Music", "Events", "Production"],
  // Фон hero: 3 колонки 9:16 (фото/видео) — заполняется через админку (/admin/venue)
  heroColumns: [],
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
  },
  events: {
    eyebrow: "Events",
    title: "A space for music events.",
    description: [
      "A space for different kinds of music events - from DJ sets and live performances to exclusive private events.",
    ],
    manifesto: ["No genre limits.", "Only music."],
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
    // Меню — правится через админку (/admin/venue)
    menu: [
      {
        id: "beer",
        title: "Beer",
        order: 1,
        items: [
          {
            id: "beer-1",
            name: "Corona, Heineken",
            price: "10 ₼",
            order: 1,
          },
          {
            id: "beer-2",
            name: "Heineken Zero",
            price: "8 ₼",
            order: 2,
          },
        ],
      },
      {
        id: "whiskey",
        title: "Whiskey",
        order: 2,
        items: [
          {
            id: "whiskey-1",
            name: "Jack Daniel's",
            price: "8 ₼",
            order: 1,
          },
          {
            id: "whiskey-2",
            name: "Jack Daniel's Honey",
            price: "8 ₼",
            order: 2,
          },
          {
            id: "whiskey-3",
            name: "Jameson",
            price: "8 ₼",
            order: 3,
          },
          {
            id: "whiskey-4",
            name: "Jim Beam",
            price: "8 ₼",
            order: 4,
          },
        ],
      },
      {
        id: "gin",
        title: "Gin",
        order: 3,
        items: [
          {
            id: "gin-1",
            name: "Hendrick's",
            price: "12 ₼",
            order: 1,
          },
          {
            id: "gin-2",
            name: "Gordon's",
            price: "8 ₼",
            order: 2,
          },
          {
            id: "gin-3",
            name: "Local Craft",
            price: "7 ₼",
            order: 3,
          },
        ],
      },
      {
        id: "rum",
        title: "Rum",
        order: 4,
        items: [
          {
            id: "rum-1",
            name: "Bacardi Superior, Captain Morgan Black/Spiced",
            price: "8 ₼",
            order: 1,
          },
          {
            id: "rum-2",
            name: "Craft Rum",
            price: "7 ₼",
            order: 2,
          },
        ],
      },
      {
        id: "tequila",
        title: "Tequila",
        order: 5,
        items: [
          {
            id: "tequila-1",
            name: "Olmeca Silver/Gold",
            price: "8 ₼",
            order: 1,
          },
        ],
      },
      {
        id: "vodka",
        title: "Vodka",
        order: 6,
        items: [
          {
            id: "vodka-1",
            name: "Russian Standard",
            price: "8 ₼",
            order: 1,
          },
          {
            id: "vodka-2",
            name: "Grey Goose",
            price: "11 ₼",
            order: 2,
          },
          {
            id: "vodka-3",
            name: "Craft Vodka",
            price: "7 ₼",
            order: 3,
          },
        ],
      },
      {
        id: "liqueur",
        title: "Liqueur",
        order: 7,
        items: [
          {
            id: "liqueur-1",
            name: "Jägermeister, Cointreau, Aperol, Campari",
            price: "8 ₼",
            order: 1,
          },
        ],
      },
      {
        id: "wine",
        title: "Wine",
        order: 8,
        items: [
          {
            id: "wine-1",
            name: "Chabiant Red dry/semi-sweet",
            price: "5/29 ₼",
            order: 1,
          },
          {
            id: "wine-2",
            name: "Chabiant White dry/semi-sweet",
            price: "5/29 ₼",
            order: 2,
          },
        ],
      },
      {
        id: "soft-drinks",
        title: "Soft Drinks",
        order: 9,
        items: [
          {
            id: "soft-drinks-1",
            name: "Tonic, Cola, Sprite, Juice (330 ml)",
            price: "5 ₼",
            order: 1,
          },
          {
            id: "soft-drinks-2",
            name: "Red Bull (250 ml)",
            price: "8 ₼",
            order: 2,
          },
          {
            id: "soft-drinks-3",
            name: "Still/Sparkling Water (500 ml)",
            price: "3 ₼",
            order: 3,
          },
        ],
      },
      {
        id: "cocktails",
        title: "Cocktails",
        order: 1,
        items: [
          {
            id: "cocktails-1",
            name: "Cuba Libre",
            price: "11 ₼",
            description: "White rum, lime juice, cola",
            order: 1,
          },
          {
            id: "cocktails-2",
            name: "Tequila Sunrise",
            price: "13 ₼",
            description: "Tequila, grenadine, orange juice",
            order: 2,
          },
          {
            id: "cocktails-3",
            name: "Sex on the Beach",
            price: "15 ₼",
            description: "Vodka, peach schnapps, cranberry juice, orange juice",
            order: 3,
          },
          {
            id: "cocktails-4",
            name: "Long Island Iced Tea",
            price: "19 ₼",
            description: "Tequila, Bacardi, vodka, gin, Cointreau, lemon, cola",
            order: 4,
          },
          {
            id: "cocktails-5",
            name: "Espresso Martini",
            price: "16 ₼",
            description: "Vodka, Kahlua, sugar syrup, espresso",
            order: 5,
          },
          {
            id: "cocktails-6",
            name: "Pornstar Martini",
            price: "16 ₼",
            description: "Vodka, passion fruit, lime, vanilla",
            order: 6,
          },
          {
            id: "cocktails-7",
            name: "Mai Tai",
            price: "13 ₼",
            description: "White & dark rum, orange Curaçao, orgeat syrup, lime juice",
            order: 7,
          },
          {
            id: "cocktails-8",
            name: "Shot set",
            price: "18 ₼",
            description: "Alcohol ...",
            order: 8,
          },
        ],
        banner: true,
      },
      {
        id: "negroni",
        title: "Negroni Selection",
        order: 2,
        items: [
          {
            id: "negroni-1",
            name: "Negroni",
            price: "13 ₼",
            description: "Gin, Campari, Martini Rosso",
            order: 1,
          },
          {
            id: "negroni-2",
            name: "Sbagliato",
            price: "13 ₼",
            description: "Campari, Martini Rosso, Prosecco",
            order: 2,
          },
          {
            id: "negroni-3",
            name: "Americano",
            price: "13 ₼",
            description: "Campari, Martini Rosso, soda",
            order: 3,
          },
          {
            id: "negroni-4",
            name: "Boulevardier",
            price: "13 ₼",
            description: "Whiskey, Campari, Martini Rosso",
            order: 4,
          },
          {
            id: "negroni-5",
            name: "Negroski",
            price: "13 ₼",
            description: "Vodka, Campari, Martini Rosso",
            order: 5,
          },
        ],
        banner: true,
      },
      {
        id: "spritz",
        title: "Spritz Collection",
        order: 3,
        items: [
          {
            id: "spritz-1",
            name: "Aperol Spritz",
            price: "15 ₼",
            description: "Aperol, Prosecco, soda",
            order: 1,
          },
          {
            id: "spritz-2",
            name: "Campari Spritz",
            price: "15 ₼",
            description: "Campari, Prosecco, soda",
            order: 2,
          },
          {
            id: "spritz-3",
            name: "Elderflower Spritz",
            price: "15 ₼",
            description: "Elderflower liqueur, Prosecco, soda",
            order: 3,
          },
        ],
        banner: true,
      },
    ],
  },
  production: {
    eyebrow: "Production",
    title: "Production packages",
    description: [
      "Record, edit and release your set - from a single-camera capture to a full multi-camera production.",
    ],
    packages: [
      {
        id: "basic",
        title: "BASIC",
        label: "Essential",
        tagline: "Record it.",
        description:
          "A basic DJ set recording for those who need high-quality source material.",
        bullets: [
          "DJ set audio recording",
          "Single-camera video shoot",
          "Raw files delivered",
          "No video editing",
          "Audio mastering",
        ],
        result: "Result: an audio recording and raw video.",
        price: "100 AZN",
        order: 1,
      },
      {
        id: "standard",
        title: "STANDARD",
        label: "Complete",
        tagline: "Record it. Finish it.",
        description: "A complete DJ set with post-production, ready to publish.",
        bullets: [
          "DJ set audio recording",
          "Single-camera video",
          "Full DJ set editing",
          "Audio mastering",
          "5 final highlights in 16:9",
        ],
        result: "Result: a finished audio set and edited video.",
        price: "200 AZN",
        order: 2,
      },
      {
        id: "premium",
        title: "PREMIUM",
        label: "Maximum",
        tagline: "Record it. Produce it. Share it.",
        description:
          "Extended production with multi-camera shooting and extra content for promotion.",
        bullets: [
          "DJ set audio recording",
          "Multi-camera video shoot (2 - DJI & Insta360)",
          "Full DJ set editing",
          "Audio mastering",
          "Curated short Reels editing (3)",
          "Extra horizontal highlights 16:9 (5)",
        ],
        result: "Result: a full set release and extra content for socials.",
        price: "400 AZN",
        order: 3,
      },
    ],
    servicesTitle: "Production services (for custom)",
    services: [
      {
        id: "audio-production",
        title: "Audio Production",
        order: 1,
        items: [
          { id: "ap-1", name: "Audio Recording + Free Mastering", price: "20 AZN", order: 1 },
          { id: "ap-2", name: "Audio Editing", price: "20 AZN", order: 2 },
        ],
      },
      {
        id: "video-recording",
        title: "Video Recording",
        order: 2,
        items: [
          { id: "vr-1", name: "Single-Camera Recording DJI", price: "50 AZN", order: 1 },
          { id: "vr-2", name: "Single-Camera Recording Insta360", price: "100 AZN", order: 2 },
          { id: "vr-3", name: "Single-Camera Recording Sony Alpha 7", price: "150 AZN", order: 3 },
          { id: "vr-4", name: "Single-Camera Recording Sony FX3", price: "200 AZN", order: 4 },
          { id: "vr-5", name: "Multi-Camera Recording", price: "Custom", order: 5 },
          { id: "vr-6", name: "Backstage Reel + Editing", price: "50 AZN", order: 6 },
          { id: "vr-7", name: "Backstage Photo + Editing", price: "50 AZN", order: 7 },
        ],
      },
      {
        id: "video-editing",
        title: "Video Editing & Delivery",
        order: 3,
        items: [
          { id: "ve-1", name: "Live Stream Delivery", price: "20 AZN", order: 1 },
          { id: "ve-2", name: "Raw Footage Delivery", price: "30 AZN", order: 2 },
          { id: "ve-3", name: "Full DJ Set Editing", price: "Custom", order: 3 },
          { id: "ve-4", name: "Multi-Camera Editing", price: "Custom", order: 4 },
        ],
      },
      {
        id: "short-form",
        title: "Short-Form & Highlight Content",
        order: 4,
        items: [
          { id: "sf-1", name: "Instagram Reel Editing", price: "30 AZN", order: 1 },
          { id: "sf-2", name: "Instagram Highlights or Custom Reel", price: "Custom", order: 2 },
          { id: "sf-3", name: "Horizontal Highlight Clip (16:9)", price: "30 AZN", order: 3 },
          { id: "sf-4", name: "Horizontal Highlight Custom Reel", price: "Custom", order: 4 },
        ],
      },
    ],
  },
  coaching: {
    eyebrow: "Coaching",
    title: "DJ Courses by RAAM",
    description: ["Two types of courses - Basic and Pro, each with 8 lessons."],
    courses: [
      {
        id: "basic-course",
        title: "Basic",
        note: "8 lessons",
        order: 1,
        prices: [
          { id: "bc-1", label: "Group (max. 3 people)", price: "200 AZN", order: 1 },
          { id: "bc-2", label: "Individual", price: "300 AZN", order: 2 },
        ],
      },
      {
        id: "pro-course",
        title: "Pro",
        note: "8 lessons + practice",
        order: 2,
        prices: [
          { id: "pc-1", label: "Individual", price: "400 AZN", order: 1 },
        ],
      },
    ],
  },
  contacts: {
    address: "12 Tarlan Aliyarbeyov st., Baku, Azerbaijan",
    hours: "Thu, Fri, Sat, Sun · 20:00-04:00",
  },
};
