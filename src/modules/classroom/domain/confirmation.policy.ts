export function requireHumanConfirmation(isHumanConfirmed: boolean): void {
  if (!isHumanConfirmed) throw new Error("Human confirmation is required");
}
