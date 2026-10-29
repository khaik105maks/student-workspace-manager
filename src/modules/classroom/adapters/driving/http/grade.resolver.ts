import type { ReadGradeCase } from "@/modules/classroom/application/use-cases/read-grade.case";
import { studentRequestSchema } from "./student.schema";
export class GradeResolver {
  constructor(private readonly readGrade: ReadGradeCase) {}
  resolve(payload: unknown) { return this.readGrade.execute(studentRequestSchema.parse(payload).courseId); }
}
