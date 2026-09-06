import { describe, expect, it } from "vitest";

import { memberEmail, memberEmails } from "./member-email.value";

describe("memberEmail", () => {
  it("normalizes a copied member address", () => {
    expect(memberEmail("  Student\\@student.khai.edu ").value).toBe("student@student.khai.edu");
  });

  it("rejects an invalid address", () => {
    expect(() => memberEmail("not-an-email")).toThrow("Invalid member email");
  });

  it("removes duplicates without mutating the input", () => {
    const source = ["ONE@student.khai.edu", "one@student.khai.edu"];

    expect(memberEmails(source)).toEqual([memberEmail("one@student.khai.edu")]);
    expect(source).toEqual(["ONE@student.khai.edu", "one@student.khai.edu"]);
  });
});
