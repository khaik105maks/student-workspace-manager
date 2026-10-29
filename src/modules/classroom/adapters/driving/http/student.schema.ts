import { z } from "zod";

import type { StudentResponse } from "./student.type";

export const studentResponseSchema: z.ZodType<StudentResponse> = z.object({
  students: z.array(z.object({ id: z.string(), email: z.email(), name: z.string() })),
});

export const studentRequestSchema = z.object({ courseId: z.string().min(1) });
