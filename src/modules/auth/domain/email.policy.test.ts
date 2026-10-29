import { describe, expect, it } from "vitest";

import { isAllowedEmail } from "./email.policy";

describe("isAllowedEmail", () => {
  it("allows a KhAI staff account", () => {
    expect(isAllowedEmail("teacher@khai.edu")).toBe(true);
  });

  it("rejects external and student subdomain accounts", () => {
    expect(isAllowedEmail("teacher@gmail.com")).toBe(false);
    expect(isAllowedEmail("student@student.khai.edu")).toBe(false);
  });

  it("rejects a missing email", () => {
    expect(isAllowedEmail(undefined)).toBe(false);
  });
});
