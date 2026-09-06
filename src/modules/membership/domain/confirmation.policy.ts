export class ConfirmationRequiredError extends Error {
  override readonly name = "ConfirmationRequiredError";

  constructor() {
    super("Human confirmation is required before adding members");
  }
}

export function requireHumanConfirmation(isHumanConfirmed: boolean): void {
  if (!isHumanConfirmed) {
    throw new ConfirmationRequiredError();
  }
}
