import { z } from "zod";

import type { LoggerService } from "@/modules/membership/application/ports/logger.service";
import type { MembershipService } from "@/modules/membership/application/ports/membership.service";
import type { MemberEmail } from "@/modules/membership/domain/member-email.value";
import type { MemberStatus } from "@/modules/membership/domain/member-status.value";
import type { Member, MemberKind, MemberRole } from "@/modules/membership/domain/member.value";
import type { Membership } from "@/modules/membership/domain/membership.value";

import { googleMembershipListSchema, googleMembershipSchema } from "./google-member.schema";
import type { GoogleMembership } from "./google-member.type";

const googleMemberStateSchema = z.enum(["JOINED", "INVITED", "NOT_A_MEMBER"]);
const googleMemberKindSchema = z.enum(["HUMAN", "BOT"]);
const googleMemberRoleSchema = z.enum(["ROLE_MEMBER", "ROLE_MANAGER"]);
const memberStatuses = {
  JOINED: "joined",
  INVITED: "invited",
  NOT_A_MEMBER: "not-member",
} satisfies Readonly<Record<z.infer<typeof googleMemberStateSchema>, MemberStatus>>;
const memberKinds = {
  HUMAN: "human",
  BOT: "bot",
} satisfies Readonly<Record<z.infer<typeof googleMemberKindSchema>, MemberKind>>;
const memberRoles = {
  ROLE_MEMBER: "member",
  ROLE_MANAGER: "manager",
} satisfies Readonly<Record<z.infer<typeof googleMemberRoleSchema>, MemberRole>>;

export class GoogleChatMembershipService implements MembershipService {
  constructor(
    private readonly accessToken: string,
    private readonly loggerService: LoggerService,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  list(spaceId: string): Promise<ReadonlyArray<Member>> {
    this.loggerService.info("Listing Google Chat memberships", { spaceId });
    return this.listPage(spaceId);
  }

  async check(spaceId: string, emails: ReadonlyArray<MemberEmail>): Promise<ReadonlyArray<Membership>> {
    this.loggerService.info("Checking Google Chat memberships", memberBatchContext(spaceId, emails));
    await this.request(`${spaceId}/members?pageSize=1`, { method: "GET" }, googleMembershipListSchema);
    return emails.reduce<Promise<ReadonlyArray<Membership>>>(async (pending, email) => {
      const memberships = await pending;
      return [...memberships, await this.checkMember(spaceId, email)];
    }, Promise.resolve([]));
  }

  add(spaceId: string, emails: ReadonlyArray<MemberEmail>): Promise<ReadonlyArray<Membership>> {
    this.loggerService.info("Adding Google Chat memberships", memberBatchContext(spaceId, emails));
    return Promise.all(emails.map((email) => this.addMember(spaceId, email)));
  }

  private async checkMember(spaceId: string, email: MemberEmail): Promise<Membership> {
    try {
      const membership = await this.request(`${spaceId}/members/${encodeURIComponent(email.value)}`, { method: "GET" }, googleMembershipSchema);
      return { email, status: knownMemberStatus(membership.state ?? "UNKNOWN") };
    } catch (failure: unknown) {
      return missingMembership(failure, email);
    }
  }

  private async addMember(spaceId: string, email: MemberEmail): Promise<Membership> {
    const membership = await this.request(
      `${spaceId}/members`,
      { method: "POST", body: JSON.stringify({ member: { name: `users/${email.value}` } }) },
      googleMembershipSchema,
    );
    return { email, status: memberStatus(membership.state) };
  }

  private async listPage(spaceId: string, pageToken?: string): Promise<ReadonlyArray<Member>> {
    const query = memberListQuery(pageToken);
    const memberPage = await this.request(
      `${spaceId}/members?${query.toString()}`,
      { method: "GET" },
      googleMembershipListSchema,
    );
    const members = memberPage.memberships.map(toMember);
    if (memberPage.nextPageToken === undefined) return members;
    return members.concat(await this.listPage(spaceId, memberPage.nextPageToken));
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

export class GoogleChatRequestError extends Error {
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

function memberListQuery(pageToken?: string): URLSearchParams {
  const query = new URLSearchParams({ pageSize: "1000", showInvited: "true" });
  if (pageToken !== undefined) query.set("pageToken", pageToken);
  return query;
}

function toMember(membership: GoogleMembership): Member {
  return {
    identity: membership.member?.name ?? membership.groupMember?.name ?? "unknown",
    kind: memberKind(membership),
    status: memberStatus(membership.state),
    role: memberRole(membership.role),
  };
}

function memberKind(membership: GoogleMembership): MemberKind {
  if (membership.groupMember !== undefined) return "group";
  const parsedKind = googleMemberKindSchema.safeParse(membership.member?.type);
  return parsedKind.success ? memberKinds[parsedKind.data] : "unknown";
}

function memberRole(googleRole: string | undefined): MemberRole {
  const parsedRole = googleMemberRoleSchema.safeParse(googleRole);
  return parsedRole.success ? memberRoles[parsedRole.data] : "unknown";
}

function missingMembership(failure: unknown, email: MemberEmail): Membership {
  if (failure instanceof GoogleChatRequestError && failure.statusCode === 404) return { email, status: "not-member" };
  throw failure;
}
