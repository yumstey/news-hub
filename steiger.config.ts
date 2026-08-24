import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      "fsd/forbidden-imports": "error",
      "fsd/no-public-api-sidestep": "error",
      "fsd/no-cross-imports": "error",
      "fsd/public-api": "error",
      "fsd/no-layer-public-api": "error",
      "fsd/no-ui-in-app": "error",
      "fsd/segments-by-purpose": "error",
      "fsd/shared-lib-grouping": "error",
      "fsd/no-reserved-folder-names": "error",
      "fsd/no-segments-on-sliced-layers": "error",
      "fsd/no-segmentless-slices": "error",
      "fsd/typo-in-layer-name": "error",
      "fsd/ambiguous-slice-names": "error",
      "fsd/inconsistent-naming": "error",
      "fsd/no-processes": "error",
      "fsd/repetitive-naming": "warn",
      "fsd/excessive-slicing": "warn",
      "fsd/insignificant-slice": "warn",
    },
  },
]);
