import { renewInviteSchema } from "./renew-invite.schema";
import type { RenewInviteCase } from "@/modules/classroom/application/use-cases/renew-invite.case";

export class RenewInviteResolver {
  constructor(private readonly renew: RenewInviteCase) {}
  resolve(payload: unknown, actorEmail: string) { return this.renew.execute({ ...renewInviteSchema.parse(payload), actorEmail }); }
}
