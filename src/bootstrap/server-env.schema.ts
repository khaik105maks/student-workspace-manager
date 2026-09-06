import { z } from "zod";

import type { ServerEnv } from "./server-env.type";

const serverEnvSchema: z.ZodType<ServerEnv> = z
  .object({
    AUTH_SECRET: z.string().min(32),
    AUTH_GOOGLE_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),
    AUDIT_PATH: z.string().default("data/audit.jsonl"),
    LOG_LEVEL: z.string().default("info"),
  })
  .transform((environment) => ({
    authSecret: environment.AUTH_SECRET,
    googleClientId: environment.AUTH_GOOGLE_ID,
    googleClientSecret: environment.AUTH_GOOGLE_SECRET,
    auditPath: environment.AUDIT_PATH,
    logLevel: environment.LOG_LEVEL,
  }));

export function serverEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}
