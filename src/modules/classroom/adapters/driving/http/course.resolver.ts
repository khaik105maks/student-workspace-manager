import type { ListCourseCase } from "@/modules/classroom/application/use-cases/list-course.case";
import type { Course } from "@/modules/classroom/domain/course.value";

import type { CourseView } from "./course.type";

export class CourseResolver {
  constructor(private readonly listCourseCase: ListCourseCase) {}

  resolve(): Promise<ReadonlyArray<CourseView>> {
    return this.listCourseCase.execute().then((courses) => courses.map(toCourseView));
  }
}

function toCourseView(course: Course): CourseView {
  return { ...course };
}
