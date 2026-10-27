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
  contacts: {
    address: "12 Tarlan Aliyarbeyov st., Baku, Azerbaijan",
    hours: "Thu, Fri, Sat, Sun · 20:00-04:00",
  },
};
