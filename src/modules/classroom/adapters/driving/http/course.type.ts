export interface CourseView {
  readonly id: string;
  readonly name: string;
  readonly section: string;
}

export interface CourseResponse {
  readonly courses: ReadonlyArray<CourseView>;
}
