import { z } from "zod";

import type { GoogleMembership, GoogleMembershipList } from "./google-member.type";

export const googleMembershipSchema: z.ZodType<GoogleMembership> = z.object({
  state: z.string().optional(),
  role: z.string().optional(),
  member: z.object({ name: z.string().optional(), type: z.string().optional() }).optional(),
  groupMember: z.object({ name: z.string().optional() }).optional(),
});

export const googleMembershipListSchema: z.ZodType<GoogleMembershipList> = z.object({
  memberships: z.array(googleMembershipSchema).default([]),
  nextPageToken: z.string().optional(),
});
