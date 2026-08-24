export const DISCIPLINE_SOURCE = [
  {
    id: "dis-cs2",
    slug: "cs2",
    kind: "esport",
    module: "esports",
    title: "Counter-Strike 2",
    short_title: "CS2",
    description:
      "Матчи, результаты, мировой рейтинг команд, составы и статистика игроков Counter-Strike 2.",
    icon: "CS2",
    logo: {
      url: "/cs2_logo.jpg",
      width: 360,
      height: 360,
      alt: "Логотип Counter-Strike 2",
    },
    has_live_scores: true,
    seo: {
      title: "Counter-Strike 2",
      description:
        "CS2: расписание матчей, результаты, мировой рейтинг команд, профили игроков, турниры и статистика.",
    },
  },
] as const
