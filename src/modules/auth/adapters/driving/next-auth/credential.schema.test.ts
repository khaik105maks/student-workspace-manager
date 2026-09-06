import { describe, expect, it } from "vitest";

import { credentialSchema } from "./credential.schema";

describe("credentialSchema", () => {
  it("accepts a complete server credential", () => {
    expect(
      credentialSchema.parse({ email: "teacher@khai.edu" }),
    ).toEqual({ email: "teacher@khai.edu" });
  });

  it("rejects a missing identity email", () => {
    expect(() => credentialSchema.parse({ accessToken: "token" })).toThrow();
  });
});
