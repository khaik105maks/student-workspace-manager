import { z } from "zod";

import type { GoogleCourseList, GoogleInvitation, GoogleStudentList } from "./classroom.type";

export const googleInvitationSchema: z.ZodType<GoogleInvitation> = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  courseId: z.string().optional(),
  role: z.string().optional(),
});

export const googleCourseListSchema: z.ZodType<GoogleCourseList> = z.object({
  courses: z.array(z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    section: z.string().optional(),
  })).default([]),
  nextPageToken: z.string().optional(),
});

export const googleStudentListSchema: z.ZodType<GoogleStudentList> = z.object({
  students: z.array(z.object({
    profile: z.object({
      id: z.string().optional(),
      emailAddress: z.string().optional(),
      name: z.object({ fullName: z.string().optional() }).optional(),
    }).optional(),
  })).default([]),
  nextPageToken: z.string().optional(),
});
