import { requireHumanConfirmation } from "@/modules/classroom/domain/confirmation.policy";
import { studentEmails } from "@/modules/classroom/domain/student-email.value";

import type { ClockService } from "../ports/clock.service";
import type { RosterRepo } from "../ports/roster.repo";

export class ImportRosterCase {
  constructor(private readonly repo: RosterRepo, private readonly clock: ClockService) {}

  read(owner: string) {
    return this.repo.read({ owner, courseId: "local:student-list" });
  }

  async execute(owner: string, rawEmails: ReadonlyArray<string>, isHumanConfirmed: boolean) {
    requireHumanConfirmation(isHumanConfirmed);
    const emails = studentEmails(rawEmails).map((email) => email.value);
    if (emails.length === 0 || emails.length > 500) throw new Error("Provide between 1 and 500 emails");
    const snapshot = { owner, courseId: "local:student-list", emails, savedAt: this.clock.now() };
    await this.repo.save(snapshot);
    return snapshot;
  }
}
