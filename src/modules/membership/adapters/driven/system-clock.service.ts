import type { ClockService } from "../../application/ports/clock.service";

export class SystemClockService implements ClockService {
  now(): string {
    return new Date().toISOString();
  }
}
