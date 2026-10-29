import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

import type { AuditEntry, AuditRepo } from "@/modules/membership/application/ports/audit.repo";

export class JsonlAuditRepo implements AuditRepo {
  constructor(private readonly filePath: string) {}

  async append(entry: AuditEntry): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await appendFile(this.filePath, `${JSON.stringify(entry)}\n`, "utf8");
  }
}
