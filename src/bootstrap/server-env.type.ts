export interface ServerEnv {
  readonly authSecret: string;
  readonly googleClientId: string;
  readonly googleClientSecret: string;
  readonly auditPath: string;
  readonly logLevel: string;
}
