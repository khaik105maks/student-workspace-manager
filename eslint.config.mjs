import { defineConfig, globalIgnores } from "eslint/config";
import checkFile from "eslint-plugin-check-file";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "src/modules/**/domain/*.ts": "+([a-z0-9-]).@(entity|value|policy|factory|service)?(.test)",
          "src/modules/**/application/ports/*.ts": "+([a-z0-9-]).@(service|resolver|factory|policy|facade|repo)",
          "src/modules/**/application/use-cases/*.ts": "+([a-z0-9-]).case?(.test)",
          "src/modules/**/adapters/driven/repo/*.ts": "+([a-z0-9-]).repo?(.test)",
          "src/modules/**/adapters/driven/*.ts": "+([a-z0-9-]).@(service|resolver|factory|policy|facade)?(.test)",
          "src/modules/**/adapters/driving/*.ts": "+([a-z0-9-]).@(service|resolver|factory|policy|facade)?(.test)",
        },
        {
          errorMessage: "File '{{ target }}' violates the role-suffix naming contract '{{ pattern }}'. See docs/naming.md.",
        },
      ],
      "check-file/filename-blocklist": [
        "error",
        {
          "**/{util,utils,helper,helpers,common,misc}.*": "",
        },
        { errorMessage: "Generic file '{{ target }}' is forbidden. Use a short domain concept plus an approved role suffix." },
      ],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "default", format: ["camelCase"], leadingUnderscore: "allow", trailingUnderscore: "allow" },
        { selector: "variable", format: ["camelCase", "UPPER_CASE", "PascalCase"], leadingUnderscore: "allow" },
        { selector: "function", format: ["camelCase", "PascalCase"] },
        { selector: "typeLike", format: ["PascalCase"] },
        { selector: "import", format: ["camelCase", "PascalCase"] },
        { selector: "property", format: null },
      ],
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
      "@typescript-eslint/no-non-null-assertion": "error",
      complexity: ["error", 5],
      "id-denylist": [
        "error",
        "result",
        "data",
        "item",
        "items",
        "obj",
        "temp",
        "tmp",
        "foo",
        "bar",
        "baz",
      ],
      "max-depth": ["error", 1],
      "max-lines-per-function": ["error", { max: 25, skipBlankLines: true, skipComments: true, IIFEs: true }],
      "max-params": ["error", 3],
      "max-statements": ["error", 10],
      "no-else-return": ["error", { allowElseIf: false }],
      "no-nested-ternary": "error",
      "no-restricted-syntax": [
        "error",
        { selector: "IfStatement IfStatement", message: "Nested if statements are forbidden; use guard clauses or extraction." },
        { selector: "VariableDeclaration[kind='let']", message: "Mutable local bindings are forbidden; derive a new value." },
      ],
      "no-var": "error",
      "prefer-const": "error",
    },
  },
  {
    files: ["src/modules/**/domain/**/*.ts", "src/modules/**/application/**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/prefer-readonly": "error",
      "no-restricted-syntax": [
        "error",
        { selector: "IfStatement IfStatement", message: "Nested if statements are forbidden; use guard clauses or extraction." },
        { selector: "VariableDeclaration[kind='let']", message: "Mutable local bindings are forbidden; derive a new value." },
        { selector: "TSArrayType", message: "Use ReadonlyArray<T> in the functional core; mutable array syntax is forbidden." },
        { selector: "TSPropertySignature[readonly!=true]", message: "Domain and application properties must be readonly." },
        { selector: "TSMethodSignature", message: "Use a readonly function property instead of a mutable interface method." },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
