import pino, { type Logger } from "pino";

import type { LogContext, LoggerService } from "../../application/ports/logger.service";

export class PinoLoggerService implements LoggerService {
  private readonly logger: Logger;

  constructor(level = "info") {
    this.logger = pino({
      level,
      name: "student-workspace-manager",
      redact: ["accessToken", "authorization", "headers.authorization"],
    });
  }

  info(message: string, context: LogContext = {}): void {
    this.logger.info(context, message);
  }

  error(message: string, context: LogContext = {}): void {
    this.logger.error(context, message);
  }
}
