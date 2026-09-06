import Google from "next-auth/providers/google";

const CHAT_MEMBERSHIP_SCOPE = "https://www.googleapis.com/auth/chat.memberships.readonly";

export function createGoogleAuthProvider() {
  return Google({
    authorization: {
      params: {
        access_type: "offline",
        prompt: "consent",
        scope: `openid email profile ${CHAT_MEMBERSHIP_SCOPE}`,
      },
    },
  });
}
