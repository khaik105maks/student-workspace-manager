import { GoogleChatMembershipService } from "../modules/membership/adapters/driven/google-chat-membership.service";
import { JsonlAuditRepo } from "../modules/membership/adapters/driven/repo/jsonl-audit.repo";
import { PinoLoggerService } from "../modules/membership/adapters/driven/pino-logger.service";
import { SystemClockService } from "../modules/membership/adapters/driven/system-clock.service";
import { AddMemberCase } from "../modules/membership/application/use-cases/add-member.case";
import { CheckMemberCase } from "../modules/membership/application/use-cases/check-member.case";
import { ListMemberCase } from "../modules/membership/application/use-cases/list-member.case";

export interface MembershipConfig {
  readonly accessToken: string;
  readonly auditPath: string;
  readonly logLevel: string;
}

export class MembershipFactory {
  private readonly loggerService: PinoLoggerService;

  constructor(private readonly config: MembershipConfig) {
    this.loggerService = new PinoLoggerService(config.logLevel);
  }

  createCheckMemberCase(): CheckMemberCase {
    return new CheckMemberCase(this.createMembershipService());
  }

  createListMemberCase(): ListMemberCase {
    return new ListMemberCase(this.createMembershipService());
  }

  createAddMemberCase(): AddMemberCase {
    return new AddMemberCase(
      this.createMembershipService(),
      new JsonlAuditRepo(this.config.auditPath),
      new SystemClockService(),
    );
  }

  private createMembershipService(): GoogleChatMembershipService {
    return new GoogleChatMembershipService(this.config.accessToken, this.loggerService);
  }
}
