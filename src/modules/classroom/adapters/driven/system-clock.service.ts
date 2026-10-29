import type { ClockService } from "@/modules/classroom/application/ports/clock.service";

export class SystemClockService implements ClockService {
  now(): string {
    return new Date().toISOString();
  }
}
