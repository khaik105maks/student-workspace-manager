import type { Student } from "@/modules/classroom/domain/student.value";

import type { ClassroomService } from "../ports/classroom.service";

export class ListStudentCase {
  constructor(private readonly classroomService: ClassroomService) {}

  execute(courseId: string): Promise<ReadonlyArray<Student>> {
    return this.classroomService.listStudent(courseId);
  }
}
