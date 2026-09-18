export type PluralForms = readonly [one: string, few: string, many: string]

/** Русская форма слова по числу: 1 матч, 2 матча, 5 матчей. */
export function plural(count: number, forms: PluralForms): string {
  const hundreds = Math.abs(count) % 100
  const tens = hundreds % 10

  if (hundreds >= 11 && hundreds <= 14) return forms[2]
  if (tens === 1) return forms[0]
  if (tens >= 2 && tens <= 4) return forms[1]

  return forms[2]
}

export function pluralize(count: number, forms: PluralForms): string {
  return `${count} ${plural(count, forms)}`
}
