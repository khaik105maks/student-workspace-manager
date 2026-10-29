import type { ChatMember, Course, Student } from "@/modules/workspace/domain/sync.value";

export interface SourceService {
  readonly courses: () => Promise<ReadonlyArray<Course>>;
  readonly students: (courseId: string) => Promise<ReadonlyArray<Student>>;
  readonly members: (spaceId: string) => Promise<ReadonlyArray<ChatMember>>;
  readonly invitations: (courseId: string) => Promise<ReadonlyArray<{ readonly id: string; readonly userId: string; readonly email: string }>>;
  readonly now: () => string;
}
