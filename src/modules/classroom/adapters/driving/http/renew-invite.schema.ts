import { z } from "zod";
export const renewInviteSchema = z.object({ courseId: z.string().min(1), email: z.string().trim().toLowerCase().pipe(z.email()), isHumanConfirmed: z.literal(true) });
