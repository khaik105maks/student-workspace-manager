import { z } from "zod";

import type { ServerEnv } from "./server-env.type";

const serverEnvSchema: z.ZodType<ServerEnv> = z
  .object({
    AUTH_SECRET: z.string().min(32),
    AUTH_GOOGLE_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),
    AUDIT_PATH: z.string().default("data/audit.jsonl"),
    LOG_LEVEL: z.string().default("info"),
    GOOGLE_CHAT_SPACE_ID: z.string().regex(/^spaces\/[A-Za-z0-9_-]+$/),
  })
  .transform((environment) => ({
    authSecret: environment.AUTH_SECRET,
    googleClientId: environment.AUTH_GOOGLE_ID,
    googleClientSecret: environment.AUTH_GOOGLE_SECRET,
    auditPath: environment.AUDIT_PATH,
    logLevel: environment.LOG_LEVEL,
    chatSpaceId: environment.GOOGLE_CHAT_SPACE_ID,
  }));

export function serverEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}
