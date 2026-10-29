export interface StudentView {
  readonly id: string;
  readonly email: string;
  readonly name: string;
}

export interface StudentResponse {
  readonly students: ReadonlyArray<StudentView>;
}
