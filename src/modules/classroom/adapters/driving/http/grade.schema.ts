import { z } from "zod";
import type { GradeBook } from "@/modules/classroom/domain/grade.value";
export const gradeBookSchema: z.ZodType<GradeBook> = z.object({
  assignments: z.array(z.object({ id: z.string(), title: z.string(), description: z.string(), url: z.string(), maxPoints: z.number().nullable(), deadline: z.string() })),
  submissions: z.array(z.object({ assignmentId: z.string(), userId: z.string(), state: z.string(), grade: z.number().nullable(), draftGrade: z.number().nullable(), isLate: z.boolean(), url: z.string() })),
  students: z.array(z.object({ id: z.string(), email: z.string(), name: z.string() })),
});
