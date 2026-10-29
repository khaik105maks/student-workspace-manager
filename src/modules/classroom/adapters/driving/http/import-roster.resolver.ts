import { importRosterSchema } from "./import-roster.schema";

import type { ImportRosterCase } from "@/modules/classroom/application/use-cases/import-roster.case";



export class ImportRosterResolver {
  constructor(private readonly importRoster: ImportRosterCase) {}

  read(owner: string) { return this.importRoster.read(owner); }

  save(payload: unknown, owner: string) {
    const request = importRosterSchema.parse(payload);
    return this.importRoster.execute(owner, request.emails, request.isHumanConfirmed);
  }
}
