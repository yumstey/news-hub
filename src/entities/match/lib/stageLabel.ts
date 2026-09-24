const EXACT: Record<string, string> = {
  "group stage": "Групповой этап",
  groups: "Групповой этап",
  playoffs: "Плей-офф",
  playoff: "Плей-офф",
  "swiss stage": "Швейцарская система",
  swiss: "Швейцарская система",
  "play-in": "Плей-ин",
  "play in": "Плей-ин",
  "closed qualifier": "Закрытая квалификация",
  "open qualifier": "Открытая квалификация",
  qualifier: "Квалификация",
  qualifiers: "Квалификация",
  "last chance qualifier": "Последний шанс",
  "regular season": "Регулярный сезон",
  "grand final": "Гранд-финал",
  "grand finals": "Гранд-финал",
  final: "Финал",
  finals: "Финал",
  "semi-finals": "Полуфинал",
  semifinals: "Полуфинал",
  "quarter-finals": "Четвертьфинал",
  quarterfinals: "Четвертьфинал",
  "main event": "Основной этап",
  "showmatch": "Шоу-матч",
}

const PATTERNS: [RegExp, (match: RegExpExecArray) => string][] = [
  [/^group ([a-z0-9]{1,3})$/i, (match) => `Группа ${(match[1] ?? "").toUpperCase()}`],
  [/^stage (\d+)$/i, (match) => `Стадия ${match[1] ?? ""}`],
  [/^(?:day|round) (\d+)$/i, (match) => `Тур ${match[1] ?? ""}`],
  [/^week (\d+)$/i, (match) => `Неделя ${match[1] ?? ""}`],
]

/** Название стадии турнира по-русски; незнакомые названия остаются как есть. */
export function stageLabel(stage: string): string {
  const value = stage.trim()
  const exact = EXACT[value.toLowerCase()]

  if (exact !== undefined) return exact

  for (const [pattern, build] of PATTERNS) {
    const match = pattern.exec(value)

    if (match !== null) return build(match)
  }

  return value === "—" ? "" : value
}
