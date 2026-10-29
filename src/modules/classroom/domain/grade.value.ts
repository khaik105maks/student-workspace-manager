import type { Student } from "./student.value";
export interface Assignment {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly maxPoints: number | null;
  readonly deadline: string;
}
export interface Submission {
  readonly assignmentId: string;
  readonly userId: string;
  readonly state: string;
  readonly grade: number | null;
  readonly draftGrade: number | null;
  readonly isLate: boolean;
  readonly url: string;
}
export interface GradeBook {
  readonly assignments: ReadonlyArray<Assignment>;
  readonly submissions: ReadonlyArray<Submission>;
  readonly students: ReadonlyArray<Student>;
}
