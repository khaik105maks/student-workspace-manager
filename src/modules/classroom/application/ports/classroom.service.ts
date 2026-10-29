import type { Course } from "@/modules/classroom/domain/course.value";
import type { Student } from "@/modules/classroom/domain/student.value";
import type { Invite } from "@/modules/classroom/domain/invite.value";
import type { StudentEmail } from "@/modules/classroom/domain/student-email.value";

export interface ClassroomService {
  readonly listCourse: () => Promise<ReadonlyArray<Course>>;
  readonly listStudent: (courseId: string) => Promise<ReadonlyArray<Student>>;
  readonly inviteStudent: (
    courseId: string,
    emails: ReadonlyArray<StudentEmail>,
  ) => Promise<ReadonlyArray<Invite>>;
}
