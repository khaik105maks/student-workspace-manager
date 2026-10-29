import { z } from "zod";

export const rosterRequestSchema = z.object({ courseId: z.string().trim().min(1), isHumanConfirmed: z.literal(true) });
export const rosterResponseSchema = z.object({ roster: z.object({ courseId: z.string(), emails: z.array(z.email()), savedAt: z.string() }).nullable() });
