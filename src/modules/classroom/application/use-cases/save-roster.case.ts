import { requireHumanConfirmation } from "@/modules/classroom/domain/confirmation.policy";

import type { ClassroomService } from "../ports/classroom.service";
import type { ClockService } from "../ports/clock.service";
import type { RosterKey, RosterRepo, RosterSnapshot } from "../ports/roster.repo";

export class SaveRosterCase {
  constructor(private readonly classroom: ClassroomService, private readonly roster: RosterRepo, private readonly clock: ClockService) {}

  async execute(key: RosterKey, isHumanConfirmed: boolean): Promise<RosterSnapshot> {
    requireHumanConfirmation(isHumanConfirmed);
    const students = await this.classroom.listStudent(key.courseId);
    const emails = [...new Set(students.map((student) => student.email.trim().toLowerCase()))].sort();
    const snapshot = { ...key, emails, savedAt: this.clock.now() };
    await this.roster.save(snapshot);
    return snapshot;
  }
}
