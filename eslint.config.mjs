import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
export default [{files:["**/*.{js,mjs,cjs,ts,tsx}"],ignores:[".next/**","node_modules/**","next-env.d.ts"],languageOptions:{parser:tsParser,parserOptions:{ecmaVersion:"latest",sourceType:"module",ecmaFeatures:{jsx:true}}},plugins:{"@next/next":nextPlugin,"@typescript-eslint":tsPlugin},rules:{...nextPlugin.configs["core-web-vitals"].rules,...tsPlugin.configs.recommended.rules,"@typescript-eslint/no-explicit-any":"error"}}];
