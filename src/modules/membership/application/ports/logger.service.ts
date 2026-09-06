export type LogContext = Readonly<Record<string, unknown>>;

export interface LoggerService {
  readonly info: (message: string, context?: LogContext) => void;
  readonly error: (message: string, context?: LogContext) => void;
}
