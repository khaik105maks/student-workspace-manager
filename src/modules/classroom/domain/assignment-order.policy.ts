import type { Assignment } from "./grade.value";

export function orderAssignments(assignments: ReadonlyArray<Assignment>): ReadonlyArray<Assignment> {
  return [...assignments].sort((first, second) => deadlineOrder(first.deadline) - deadlineOrder(second.deadline) || first.title.localeCompare(second.title, "uk", { numeric: true }));
}

function deadlineOrder(deadline: string): number {
  const timestamp = Date.parse(deadline);
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
}
