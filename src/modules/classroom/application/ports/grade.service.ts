import type { Assignment, Submission } from "@/modules/classroom/domain/grade.value";
export interface GradeService {
  readonly assignments: (courseId: string) => Promise<ReadonlyArray<Assignment>>;
  readonly submissions: (courseId: string) => Promise<ReadonlyArray<Submission>>;
}
