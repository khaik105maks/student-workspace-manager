import { expect, it } from "vitest";
import { orderAssignments } from "./assignment-order.policy";
import type { Assignment } from "./grade.value";

it("orders deadlines chronologically, puts missing dates last and preserves the source", () => {
  const assignments = [assignment("Lab 10", ""), assignment("Late", "2026-10-01T00:00:00Z"), assignment("Lab 2", ""), assignment("Early", "2026-09-01T00:00:00Z")];
  expect(orderAssignments(assignments).map((entry) => entry.title)).toEqual(["Early", "Late", "Lab 2", "Lab 10"]);
  expect(assignments[0]?.title).toBe("Lab 10");
});

function assignment(title: string, deadline: string): Assignment {
  return { id: title, title, deadline, description: "", url: "", maxPoints: null };
}
