import type { ListStudentCase } from "@/modules/classroom/application/use-cases/list-student.case";
import type { Student } from "@/modules/classroom/domain/student.value";

import { studentRequestSchema } from "./student.schema";
import type { StudentView } from "./student.type";

export class StudentResolver {
  constructor(private readonly listStudentCase: ListStudentCase) {}

  resolve(payload: unknown): Promise<ReadonlyArray<StudentView>> {
    const request = studentRequestSchema.parse(payload);
    return this.listStudentCase.execute(request.courseId).then((students) => students.map(toStudentView));
  }
}

function toStudentView(student: Student): StudentView {
  return { ...student };
}
