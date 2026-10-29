import type { InvitationService, PendingInvitation } from "@/modules/classroom/application/ports/invitation.service";
import { invitationPageSchema, invitationProfileSchema } from "./invitation.schema";

export class GoogleInvitationService implements InvitationService {
  constructor(private readonly token: string, private readonly fetcher: typeof fetch = fetch) {}
  async list(courseId: string, email?: string): Promise<ReadonlyArray<PendingInvitation>> {
    const query = new URLSearchParams({ courseId, pageSize: "100" });
    if (email) query.set("userId", email);
    return this.page(query);
  }
  async remove(id: string): Promise<void> { await this.request(`invitations/${encodeURIComponent(id)}`, { method: "DELETE" }); }
  async create(courseId: string, email: string): Promise<void> {
    await this.request("invitations", { method: "POST", body: JSON.stringify({ courseId, userId: email, role: "STUDENT" }) });
  }
  private async page(query: URLSearchParams): Promise<ReadonlyArray<PendingInvitation>> {
    const response = await this.request(`invitations?${query}`, { method: "GET" });
    const page = invitationPageSchema.parse(await response.json());
    const invitations = await Promise.all(page.invitations.filter((invitation) => invitation.role === "STUDENT").map(async (invitation) => ({ id: invitation.id, userId: invitation.userId, email: await this.email(invitation.userId) })));
    if (!page.nextPageToken) return invitations;
    query.set("pageToken", page.nextPageToken);
    return invitations.concat(await this.page(query));
  }
  private async email(userId: string): Promise<string> {
    const response = await this.request(`userProfiles/${encodeURIComponent(userId)}`, { method: "GET" });
    return invitationProfileSchema.parse(await response.json()).emailAddress;
  }
  private async request(path: string, init: RequestInit): Promise<Response> {
    const response = await this.fetcher(`https://classroom.googleapis.com/v1/${path}`, { ...init, headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" } });
    if (!response.ok) throw new Error(`Classroom invitation request failed: ${response.status}`);
    return response;
  }
}
