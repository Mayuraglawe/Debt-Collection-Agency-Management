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
  ]),
  {
    rules: {
      // Allow inline styles for dynamic theming - most inline styles in this project
      // are theme-based or prop-based and cannot be converted to static Tailwind classes
      '@next/next/no-css-tags': 'off',
      '@next/next/no-sync-scripts': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      // Suppress the inline style warning since we use dynamic theming
      'react/forbid-dom-props': 'off',
    }
  }
]);

export default eslintConfig;

