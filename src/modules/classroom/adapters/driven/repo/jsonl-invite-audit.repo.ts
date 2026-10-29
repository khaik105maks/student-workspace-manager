import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

import type { InviteAuditEntry, InviteAuditRepo } from "@/modules/classroom/application/ports/invite-audit.repo";

export class JsonlInviteAuditRepo implements InviteAuditRepo {
  constructor(private readonly filePath: string) {}

  async append(entry: InviteAuditEntry): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await appendFile(this.filePath, `${JSON.stringify(entry)}\n`, "utf8");
  }
}
