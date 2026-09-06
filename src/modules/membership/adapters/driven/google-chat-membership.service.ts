import { z } from "zod";

import type { LoggerService } from "@/modules/membership/application/ports/logger.service";
import type { MembershipService } from "@/modules/membership/application/ports/membership.service";
import type { MemberEmail } from "@/modules/membership/domain/member-email.value";
import type { MemberStatus } from "@/modules/membership/domain/member-status.value";
import type { Membership } from "@/modules/membership/domain/membership.value";

const membershipSchema = z.object({ state: z.string().optional() });
const membershipListSchema = z.object({ memberships: z.array(membershipSchema).default([]) });
const googleMemberStateSchema = z.enum(["JOINED", "INVITED", "NOT_A_MEMBER"]);
const memberStatuses = {
  JOINED: "joined",
  INVITED: "invited",
  NOT_A_MEMBER: "not-member",
} satisfies Readonly<Record<z.infer<typeof googleMemberStateSchema>, MemberStatus>>;

export class GoogleChatMembershipService implements MembershipService {
  constructor(
    private readonly accessToken: string,
    private readonly loggerService: LoggerService,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  check(spaceId: string, emails: ReadonlyArray<MemberEmail>): Promise<ReadonlyArray<Membership>> {
    this.loggerService.info("Checking Google Chat memberships", memberBatchContext(spaceId, emails));
    return Promise.all(emails.map((email) => this.checkMember(spaceId, email)));
  }

  add(spaceId: string, emails: ReadonlyArray<MemberEmail>): Promise<ReadonlyArray<Membership>> {
    this.loggerService.info("Adding Google Chat memberships", memberBatchContext(spaceId, emails));
    return Promise.all(emails.map((email) => this.addMember(spaceId, email)));
  }

  private async checkMember(spaceId: string, email: MemberEmail): Promise<Membership> {
    const filter = new URLSearchParams({ filter: `member.name = "users/${email.value}"` });
    const path = `${spaceId}/members?${filter.toString()}`;
    const membershipList = await this.request(path, { method: "GET" }, membershipListSchema);
    const status = membershipList.memberships.at(0)?.state;
    return { email, status: memberStatus(status) };
  }

  private async addMember(spaceId: string, email: MemberEmail): Promise<Membership> {
    const membership = await this.request(
      `${spaceId}/members`,
      { method: "POST", body: JSON.stringify({ member: { name: `users/${email.value}` } }) },
      membershipSchema,
    );
    return { email, status: memberStatus(membership.state) };
  }

  private async request<Output>(
    path: string,
    requestInit: RequestInit,
    schema: z.ZodType<Output>,
  ): Promise<Output> {
    const response = await this.fetcher(`https://chat.googleapis.com/v1/${path}`, {
      ...requestInit,
      headers: { Authorization: `Bearer ${this.accessToken}`, "Content-Type": "application/json" },
    });
    if (!response.ok) this.throwRequestError(response.status, requestInit.method);
    const payload: unknown = await response.json();
    return schema.parse(payload);
  }

  private throwRequestError(statusCode: number, method: string | undefined): never {
    this.loggerService.error("Google Chat request failed", { statusCode, method });
    throw new GoogleChatRequestError(statusCode);
  }
}

class GoogleChatRequestError extends Error {
  constructor(readonly statusCode: number) {
    super(`Google Chat request failed with status ${statusCode}`);
  }
}

function memberStatus(googleState: string | undefined): MemberStatus {
  return googleState === undefined ? "not-member" : knownMemberStatus(googleState);
}

function knownMemberStatus(googleState: string): MemberStatus {
  const parsedState = googleMemberStateSchema.safeParse(googleState);
  if (!parsedState.success) return "unknown";
  return memberStatuses[parsedState.data];
}

function memberBatchContext(spaceId: string, emails: ReadonlyArray<MemberEmail>) {
  return { spaceId, memberCount: emails.length };
}
