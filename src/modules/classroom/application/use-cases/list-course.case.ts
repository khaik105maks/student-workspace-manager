import type { Course } from "@/modules/classroom/domain/course.value";

import type { ClassroomService } from "../ports/classroom.service";

export class ListCourseCase {
  constructor(private readonly classroomService: ClassroomService) {}

  execute(): Promise<ReadonlyArray<Course>> {
    return this.classroomService.listCourse();
  }
}
