import { z } from "zod";
const safeUrl = z.url().refine((url) => url.startsWith("https://")).optional().default("");
export const assignmentPageSchema = z.object({
  courseWork: z.array(z.object({
    id: z.string(), title: z.string(), description: z.string().optional().default(""),
    alternateLink: safeUrl, maxPoints: z.number().optional(),
    dueDate: z.object({ year: z.number(), month: z.number(), day: z.number() }).optional(),
    dueTime: z.object({ hours: z.number().optional(), minutes: z.number().optional() }).optional(),
  })).optional().default([]), nextPageToken: z.string().optional(),
});
export const submissionPageSchema = z.object({
  studentSubmissions: z.array(z.object({
    courseWorkId: z.string(), userId: z.string(), state: z.string().optional().default("UNKNOWN"),
    assignedGrade: z.number().optional(), draftGrade: z.number().optional(),
    late: z.boolean().optional().default(false), alternateLink: safeUrl,
  })).optional().default([]), nextPageToken: z.string().optional(),
});
