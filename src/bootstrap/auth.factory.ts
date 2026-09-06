import NextAuth from "next-auth";

import { createGoogleAuthProvider } from "@/modules/auth/adapters/driven/google/auth.factory";
import { mergeGoogleAccount } from "@/modules/auth/adapters/driven/google/token.service";
import { isAllowedEmail } from "@/modules/auth/domain/email.policy";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [createGoogleAuthProvider()],
  callbacks: {
    signIn: ({ profile }) => isAllowedEmail(profile?.email),
    jwt: ({ token, account }) => mergeGoogleAccount(token, account),
  },
});
