import Google from "next-auth/providers/google";

const CHAT_MEMBERSHIP_SCOPE = "https://www.googleapis.com/auth/chat.memberships.readonly";
const CLASSROOM_SCOPES = [
  "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.rosters",
  "https://www.googleapis.com/auth/classroom.profile.emails",
] satisfies ReadonlyArray<string>;

export function createGoogleAuthProvider() {
  return Google({
    authorization: {
      params: {
        access_type: "offline",
        prompt: "consent",
        scope: ["openid", "email", "profile", CHAT_MEMBERSHIP_SCOPE, ...CLASSROOM_SCOPES].join(" "),
      },
    },
  });
}
