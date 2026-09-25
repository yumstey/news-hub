import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "react/forbid-dom-props": ["error", { forbid: ["style"] }],
      "react/forbid-component-props": ["error", { forbid: ["style"] }],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/index.css",
                "**/*.module.css",
                "**/*.module.scss",
                "**/*.scss",
                "**/*.sass",
              ],
              message:
                "Tailwind is the only styling mechanism. The single global sheet is src/app/styles/global.css.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/shared/api/pandaScore.ts", "src/shared/config/server/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "axios",
              message:
                "Axios is the client transport. Server code uses native fetch so it participates in framework instrumentation.",
            },
          ],
          patterns: [
            {
              group: ["@/shared/api/client", "@/shared/api/client/**"],
              message:
                "Server transport must not import the client transport.",
            },
          ],
        },
      ],
    },
  },
  {
    // Координаты сетки считаются из данных турнира: количество раундов и
    // положение матчей заранее неизвестны, поэтому классов Tailwind для них
    // не существует. Это единственное место с геометрией в разметке.
    files: ["src/widgets/tournament-bracket/ui/BracketCanvas.tsx"],
    rules: {
      "react/forbid-dom-props": "off",
    },
  },
  {
    // Ширина полос в разборе очков Valve — доля от 0 до 1 из данных: под каждое
    // значение класса Tailwind не существует.
    files: ["src/widgets/team-rankings/ui/RankingBoard.tsx", "src/widgets/match-scoreboard/ui/HeadToHead.tsx"],
    rules: {
      "react/forbid-dom-props": "off",
    },
  },
  {
    // ImageResponse (next/og) понимает только инлайновые стили: Tailwind там не работает.
    files: ["src/shared/lib/og/**", "app/**/opengraph-image.tsx"],
    rules: {
      "react/forbid-dom-props": "off",
    },
  },
  {
    files: ["src/features/**", "src/widgets/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/shared/api"],
              importNames: ["pandaOne", "pandaList", "pandaPage"],
              message:
                "Server transport is reached through an entity repository, not directly.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
