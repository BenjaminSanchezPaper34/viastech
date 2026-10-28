import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Kit signature Paper34 copié tel quel : le kit est la source de vérité, on ne le retouche pas ici.
    "components/site/SplashCursor.tsx",
    "components/site/PaperSignature.tsx",
  ]),
]);

export default eslintConfig;
