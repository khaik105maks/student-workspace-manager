/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular-dependencies",
      severity: "error",
      comment: "Cycles hide ownership and make ports replaceable only in theory.",
      from: {},
      to: { circular: true },
    },
    {
      name: "domain-does-not-depend-on-outer-layers",
      severity: "error",
      from: { path: "^src/modules/[^/]+/domain" },
      to: {
        path: "^src/(app|modules/[^/]+/(application|adapters)|bootstrap)",
      },
    },
    {
      name: "domain-has-no-runtime-package-dependencies",
      severity: "error",
      from: { path: "^src/modules/[^/]+/domain" },
      to: { dependencyTypes: ["npm"] },
    },
    {
      name: "application-does-not-depend-on-adapters",
      severity: "error",
      from: { path: "^src/modules/[^/]+/application" },
      to: { path: "^src/(app|modules/[^/]+/adapters|bootstrap)" },
    },
    {
      name: "adapters-do-not-depend-on-next-delivery",
      severity: "error",
      from: { path: "^src/modules/[^/]+/adapters" },
      to: { path: "^src/app" },
    },
    {
      name: "modules-do-not-depend-on-bootstrap",
      severity: "error",
      from: { path: "^src/modules" },
      to: { path: "^src/bootstrap" },
    },
    {
      name: "classroom-imports-only-module-public-api",
      severity: "error",
      from: { path: "^src/modules/classroom" },
      to: { path: "^src/modules/(auth|membership|workspace)/(?!public/)" },
    },
    {
      name: "auth-imports-only-module-public-api",
      severity: "error",
      from: { path: "^src/modules/auth" },
      to: { path: "^src/modules/(classroom|membership|workspace)/(?!public/)" },
    },
    {
      name: "membership-imports-only-module-public-api",
      severity: "error",
      from: { path: "^src/modules/membership" },
      to: { path: "^src/modules/(auth|classroom|workspace)/(?!public/)" },
    },
    { name: "workspace-imports-only-module-public-api", severity: "error", from: { path: "^src/modules/workspace" }, to: { path: "^src/modules/(auth|classroom|membership)/(?!public/)" } },
    {
      name: "database-libraries-only-in-repo-adapters",
      severity: "error",
      comment: "All database access belongs to adapters/driven/repo.",
      from: { pathNot: "^src/modules/[^/]+/adapters/driven/repo/" },
      to: {
        path: "^(node_modules/)?(node:sqlite|@prisma|prisma|drizzle|drizzle-orm|pg|postgres|mysql|mysql2|better-sqlite3|sqlite3|mongodb|mongoose|redis|ioredis)(/|$)",
      },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: { exportsFields: ["exports"] },
  },
};
