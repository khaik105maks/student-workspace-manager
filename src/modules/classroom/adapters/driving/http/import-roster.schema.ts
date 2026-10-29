import { z } from "zod";

export const importRosterSchema = z.object({ emails: z.array(z.string().trim().toLowerCase().pipe(z.email())).min(1).max(500), isHumanConfirmed: z.literal(true) });
