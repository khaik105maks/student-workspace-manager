export interface GoogleCourse {
  readonly id?: string | undefined;
  readonly name?: string | undefined;
  readonly section?: string | undefined;
}

export interface GoogleCourseList {
  readonly courses: ReadonlyArray<GoogleCourse>;
  readonly nextPageToken?: string | undefined;
}

export interface GoogleStudent {
  readonly profile?: GoogleProfile | undefined;
}

export interface GoogleProfile {
  readonly id?: string | undefined;
  readonly emailAddress?: string | undefined;
  readonly name?: { readonly fullName?: string | undefined } | undefined;
}

export interface GoogleStudentList {
  readonly students: ReadonlyArray<GoogleStudent>;
  readonly nextPageToken?: string | undefined;
}

export interface GoogleInvitation {
  readonly id?: string | undefined;
  readonly userId?: string | undefined;
  readonly courseId?: string | undefined;
  readonly role?: string | undefined;
}
