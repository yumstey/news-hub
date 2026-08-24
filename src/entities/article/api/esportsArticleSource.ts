const CS2 = { id: "dis-cs2", slug: "cs2", title: "Counter-Strike 2", kind: "esport" } as const

const AUTHORS = {
  sokolov: { id: "aut-004", slug: "ilya-sokolov", name: "Илья Соколов", avatar: null },
  orlov: { id: "aut-002", slug: "maksim-orlov", name: "Максим Орлов", avatar: null },
} as const

const ESPORTS = { id: "cat-esports", slug: "kibersport", title: "Киберспорт" } as const

function cover(index: number, alt: string) {
  return {
    url: `/mock/covers/cover-${String(index).padStart(2, "0")}.png`,
    width: 1200,
    height: 675,
    alt,
  }
}

export const ESPORTS_ARTICLE_SOURCE = [
  {
    id: "art-cs-001",
    slug: "northern-vanguard-v-polufinale-aurora-major",
    module: "esports",
    discipline: CS2,
    title: "Northern Vanguard прошла в полуфинал Aurora Major",
    excerpt:
      "Шведы обыграли Solaris в трёх картах и продлили серию побед до шести матчей подряд.",
    cover: cover(10, "Сцена турнира по Counter-Strike 2"),
    author: AUTHORS.sokolov,
    primary_category: ESPORTS,
    categories: [ESPORTS],
    tags: ["Aurora Major", "Northern Vanguard", "плей-офф"],
    metrics: { views: 34210 },
    is_featured: true,
    body: [
      {
        kind: "paragraph",
        text: "Матч продлился три карты. Northern Vanguard уверенно забрала Mirage, отдала Ancient и не оставила соперникам шансов на решающем Nuke.",
      },
      { kind: "heading", level: 2, text: "Ключевой момент" },
      {
        kind: "paragraph",
        text: "Решающим стал отрезок второй половины Nuke: снайпер vexo закрыл четыре раунда подряд, а разрыв в счёте вырос до шести.",
      },
      {
        kind: "quote",
        text: "Мы понимали, что Ancient отдадим. План был выйти на решающую карту с запасом информации, и он сработал.",
        attribution: "Капитан Northern Vanguard",
      },
    ],
    seo: {
      title: "Northern Vanguard в полуфинале Aurora Major",
      description:
        "Northern Vanguard обыграла Solaris Esports со счётом 2:1 и вышла в полуфинал Aurora Major 2026.",
      og_image: null,
    },
    created_at: "2026-08-22T18:40:00.000Z",
    updated_at: "2026-08-22T19:20:00.000Z",
    published_at: "2026-08-22T19:00:00.000Z",
  },
  {
    id: "art-cs-002",
    slug: "kryptic-obygrala-vertex-nine",
    module: "esports",
    discipline: CS2,
    title: "Kryptic обыграла Vertex Nine всухую",
    excerpt:
      "Украинский коллектив взял Anubis и Inferno, не отдав ни одной карты в четвертьфинале.",
    cover: cover(11, "Игроки на сцене киберспортивной арены"),
    author: AUTHORS.sokolov,
    primary_category: ESPORTS,
    categories: [ESPORTS],
    tags: ["Aurora Major", "Kryptic", "плей-офф"],
    metrics: { views: 28640 },
    is_featured: true,
    body: [
      {
        kind: "paragraph",
        text: "Kryptic не оставила шансов Vertex Nine: 13:8 на Anubis и 13:11 на Inferno при том, что вторая карта была выбором соперника.",
      },
      {
        kind: "list",
        ordered: false,
        items: [
          "shvts — рейтинг 1.48 за серию",
          "Kryptic выиграла 12 из 14 пистолетных раундов на турнире",
          "Vertex Nine впервые за сезон проиграла на своём пике",
        ],
      },
      {
        kind: "paragraph",
        text: "В полуфинале команда встретится с победителем пары Northern Vanguard — Kryptic по верхней сетке.",
      },
    ],
    seo: {
      title: "Kryptic обыграла Vertex Nine 2:0",
      description:
        "Kryptic прошла Vertex Nine всухую в четвертьфинале Aurora Major 2026. Разбор карт и статистика.",
      og_image: null,
    },
    created_at: "2026-08-22T21:10:00.000Z",
    updated_at: "2026-08-22T21:40:00.000Z",
    published_at: "2026-08-22T21:30:00.000Z",
  },
  {
    id: "art-cs-003",
    slug: "shvts-luchshiy-igrok-chetvertfinalov",
    module: "esports",
    discipline: CS2,
    title: "shvts — лучший игрок четвертьфиналов по рейтингу",
    excerpt:
      "Снайпер Kryptic закончил стадию с рейтингом 1.48 и лучшим показателем урона за раунд.",
    cover: cover(12, "Игровая периферия на турнирном компьютере"),
    author: AUTHORS.orlov,
    primary_category: ESPORTS,
    categories: [ESPORTS],
    tags: ["Aurora Major", "статистика", "shvts"],
    metrics: { views: 19870 },
    is_featured: false,
    body: [
      {
        kind: "paragraph",
        text: "По итогам четвертьфиналов лучший рейтинг показал снайпер Kryptic: 1.48 при 92.6 урона за раунд и KAST 77.4.",
      },
      {
        kind: "paragraph",
        text: "Второе место занял vexo из Northern Vanguard, третье — zaryn из Solaris Esports.",
      },
    ],
    seo: {
      title: "shvts — лучший по рейтингу в четвертьфиналах",
      description:
        "Статистика четвертьфиналов Aurora Major 2026: рейтинг, урон за раунд и KAST лучших игроков.",
      og_image: null,
    },
    created_at: "2026-08-23T08:00:00.000Z",
    updated_at: "2026-08-23T08:30:00.000Z",
    published_at: "2026-08-23T08:15:00.000Z",
  },
  {
    id: "art-cs-004",
    slug: "solaris-obnovila-sostav",
    module: "esports",
    discipline: CS2,
    title: "Solaris Esports обновила состав перед Vertex Masters",
    excerpt:
      "Команда переводит support-игрока в запас и подписывает замену из своей академии.",
    cover: cover(1, "Тренировочная база киберспортивной команды"),
    author: AUTHORS.sokolov,
    primary_category: ESPORTS,
    categories: [ESPORTS],
    tags: ["трансферы", "Solaris Esports", "составы"],
    metrics: { views: 15420 },
    is_featured: false,
    body: [
      {
        kind: "paragraph",
        text: "Организация объявила о переводе одного из игроков в запас. Место в основе займёт воспитанник академии, дебютировавший в закрытых квалификациях.",
      },
      {
        kind: "quote",
        text: "Мы не меняем стиль. Мы меняем темп: новому составу нужна более агрессивная первая половина.",
        attribution: "Главный тренер Solaris Esports",
      },
      {
        kind: "paragraph",
        text: "Первым турниром для обновлённого состава станет Vertex Masters Berlin в сентябре.",
      },
    ],
    seo: {
      title: "Solaris Esports обновила состав",
      description:
        "Solaris Esports переводит игрока в запас и подписывает замену перед Vertex Masters Berlin.",
      og_image: null,
    },
    created_at: "2026-08-20T10:00:00.000Z",
    updated_at: "2026-08-20T11:00:00.000Z",
    published_at: "2026-08-20T10:30:00.000Z",
  },
  {
    id: "art-cs-005",
    slug: "reyting-kryptic-podnyalas-na-vtoroe-mesto",
    module: "esports",
    discipline: CS2,
    title: "Мировой рейтинг: Kryptic поднялась на второе место",
    excerpt:
      "Ember Collective опустилась на третью строчку, Meridian потеряла две позиции.",
    cover: cover(2, "Табло с турнирной сеткой"),
    author: AUTHORS.orlov,
    primary_category: ESPORTS,
    categories: [ESPORTS],
    tags: ["рейтинг", "Kryptic", "аналитика"],
    metrics: { views: 22150 },
    is_featured: false,
    body: [
      {
        kind: "paragraph",
        text: "После четвертьфиналов Aurora Major рейтинг обновился: Kryptic поднялась на второе место, обойдя Ember Collective.",
      },
      {
        kind: "list",
        ordered: true,
        items: [
          "Northern Vanguard — 986 очков, без изменений",
          "Kryptic — 921 очко, плюс одна позиция",
          "Ember Collective — 874 очка, минус одна позиция",
        ],
      },
      {
        kind: "paragraph",
        text: "Следующее обновление рейтинга выйдет после гранд-финала.",
      },
    ],
    seo: {
      title: "Мировой рейтинг CS2: Kryptic на втором месте",
      description:
        "Обновление мирового рейтинга команд CS2 после четвертьфиналов Aurora Major 2026.",
      og_image: null,
    },
    created_at: "2026-08-23T12:00:00.000Z",
    updated_at: "2026-08-23T12:30:00.000Z",
    published_at: "2026-08-23T12:10:00.000Z",
  },
  {
    id: "art-cs-006",
    slug: "aurora-major-raspisanie-polufinalov",
    module: "esports",
    discipline: CS2,
    title: "Aurora Major 2026: расписание полуфиналов",
    excerpt:
      "Две пары, оба матча в формате до двух побед, начало в 18:00 и 21:30 по местному времени.",
    cover: cover(3, "Главная арена турнира перед матчем"),
    author: AUTHORS.sokolov,
    primary_category: ESPORTS,
    categories: [ESPORTS],
    tags: ["Aurora Major", "расписание", "плей-офф"],
    metrics: { views: 26980 },
    is_featured: false,
    body: [
      {
        kind: "paragraph",
        text: "Организаторы опубликовали расписание полуфинальной стадии. Обе пары играют в один день, гранд-финал состоится 30 августа.",
      },
      {
        kind: "list",
        ordered: false,
        items: [
          "Northern Vanguard — Kryptic, 18:00",
          "Ember Collective — Solaris Esports, 21:30",
          "Гранд-финал — 30 августа, до трёх побед",
        ],
      },
    ],
    seo: {
      title: "Расписание полуфиналов Aurora Major 2026",
      description:
        "Полуфиналы Aurora Major 2026: пары, время начала и формат матчей плей-офф.",
      og_image: null,
    },
    created_at: "2026-08-23T15:00:00.000Z",
    updated_at: "2026-08-23T15:20:00.000Z",
    published_at: "2026-08-23T15:10:00.000Z",
  },
  {
    id: "art-cs-007",
    slug: "ironclad-vozvrashchaetsya-v-evropu",
    module: "esports",
    discipline: CS2,
    title: "Ironclad возвращается в европейский буткемп",
    excerpt:
      "Бразильская команда проведёт два месяца в Европе перед осенней частью сезона.",
    cover: cover(4, "Игроки во время тренировочной сессии"),
    author: AUTHORS.orlov,
    primary_category: ESPORTS,
    categories: [ESPORTS],
    tags: ["Ironclad", "буткемп", "подготовка"],
    metrics: { views: 12340 },
    is_featured: false,
    body: [
      {
        kind: "paragraph",
        text: "Ironclad объявила о переезде на европейский буткемп. Команда рассчитывает поднять уровень практики за счёт более сильных спарринг-партнёров.",
      },
      {
        kind: "paragraph",
        text: "Прошлый европейский сбор закончился титулом на домашнем турнире, и организация рассчитывает повторить результат.",
      },
    ],
    seo: {
      title: "Ironclad уезжает на европейский буткемп",
      description:
        "Ironclad проведёт два месяца в Европе перед осенней частью сезона CS2.",
      og_image: null,
    },
    created_at: "2026-08-18T09:00:00.000Z",
    updated_at: "2026-08-18T09:40:00.000Z",
    published_at: "2026-08-18T09:20:00.000Z",
  },
  {
    id: "art-cs-008",
    slug: "kak-izmenilas-meta-posle-obnovleniya",
    module: "esports",
    discipline: CS2,
    title: "Как изменилась мета CS2 после летнего обновления",
    excerpt:
      "Разбираем статистику пиков карт и долю раундов, выигранных за сторону защиты.",
    cover: cover(5, "Экран с картой Counter-Strike 2"),
    author: AUTHORS.orlov,
    primary_category: ESPORTS,
    categories: [ESPORTS],
    tags: ["аналитика", "мета", "карты"],
    metrics: { views: 31280 },
    is_featured: true,
    body: [
      {
        kind: "paragraph",
        text: "Летнее обновление затронуло баланс двух карт из активного пула. Через месяц после патча статистика показывает заметный сдвиг.",
      },
      { kind: "heading", level: 2, text: "Что показывают цифры" },
      {
        kind: "list",
        ordered: false,
        items: [
          "Доля побед защиты на Nuke выросла с 51 до 55 процентов",
          "Anubis впервые вошёл в тройку самых пикаемых карт",
          "Vertigo банится в 68 процентах серий",
        ],
      },
      {
        kind: "paragraph",
        text: "Команды с сильной защитой получили преимущество в длинных сериях, где решает третья и четвёртая карта.",
      },
    ],
    seo: {
      title: "Мета CS2 после летнего обновления",
      description:
        "Статистика пиков карт и доля выигранных раундов за защиту после летнего патча CS2.",
      og_image: null,
    },
    created_at: "2026-08-16T11:00:00.000Z",
    updated_at: "2026-08-16T12:00:00.000Z",
    published_at: "2026-08-16T11:30:00.000Z",
  },
] as const
