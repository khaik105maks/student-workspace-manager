import type { RosterRepo } from "@/modules/classroom/application/ports/roster.repo";
import type { SaveRosterCase } from "@/modules/classroom/application/use-cases/save-roster.case";

import { rosterRequestSchema } from "./roster.schema";
import { studentRequestSchema } from "./student.schema";

export class RosterResolver {
  constructor(private readonly repo: RosterRepo, private readonly saveRoster: SaveRosterCase) {}

  read(payload: unknown, owner: string) {
    const request = studentRequestSchema.parse(payload);
    return this.repo.read({ owner, courseId: request.courseId });
  }

  save(payload: unknown, owner: string) {
    const request = rosterRequestSchema.parse(payload);
    return this.saveRoster.execute({ owner, courseId: request.courseId }, request.isHumanConfirmed);
  }
}
