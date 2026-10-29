import { z } from "zod";
export const invitationPageSchema = z.object({ invitations: z.array(z.object({ id: z.string(), userId: z.string(), courseId: z.string(), role: z.string() })).default([]), nextPageToken: z.string().optional() });
export const invitationProfileSchema = z.object({ emailAddress: z.string().default("") });
