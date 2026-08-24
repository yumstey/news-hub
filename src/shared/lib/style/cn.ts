import { clsx } from "clsx"
import type { ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["display", "title", "heading", "subheading", "lead", "body", "caption", "overline"],
        },
      ],
      rounded: [{ rounded: ["control", "surface"] }],
      shadow: [{ shadow: ["surface", "overlay"] }],
      "max-w": [{ "max-w": ["page", "content", "narrow"] }],
    },
  },
})

export function cn(...values: ClassValue[]): string {
  return twMerge(clsx(values))
}

export type { ClassValue }
