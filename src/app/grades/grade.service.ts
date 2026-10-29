import { z } from "zod";
import { gradeBookSchema } from "@/modules/classroom/adapters/driving/http/grade.schema";
export async function readGradeBook(courseId: string, signal: AbortSignal) {
  const response = await fetch(`/api/classroom/grade?courseId=${encodeURIComponent(courseId)}`, { signal, cache: "no-store" });
  const payload: unknown = await response.json();
  if (!response.ok) throw new Error(z.object({ message: z.string() }).parse(payload).message);
  return gradeBookSchema.parse(payload);
}
