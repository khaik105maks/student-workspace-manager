import type { GradeService } from "../ports/grade.service";
import type { ClassroomService } from "../ports/classroom.service";
import type { GradeBook } from "@/modules/classroom/domain/grade.value";
export class ReadGradeCase {
  constructor(private readonly grades: GradeService, private readonly classroom: ClassroomService) {}
  async execute(courseId: string): Promise<GradeBook> {
    const [assignments, submissions, students] = await Promise.all([
      this.grades.assignments(courseId), this.grades.submissions(courseId), this.classroom.listStudent(courseId),
    ]);
    return { assignments, submissions, students };
  }
}
