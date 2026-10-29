import { z } from "zod";

import type { CourseResponse } from "./course.type";

export const courseResponseSchema: z.ZodType<CourseResponse> = z.object({
  courses: z.array(z.object({ id: z.string(), name: z.string(), section: z.string() })),
});
