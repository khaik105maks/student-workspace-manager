import { describe, expect, it, vi } from "vitest";

import { GoogleAccessTokenService } from "./access-token.service";

const config = { clientId: "client-id", clientSecret: "client-secret" };

describe("GoogleAccessTokenService", () => {
  it("returns an active token without a request", async () => {
    const fetcher = vi.fn();
    const service = new GoogleAccessTokenService(config, fetcher, () => 1_000);

    await expect(service.resolve(activeToken())).resolves.toBe("active-token");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("refreshes an expired token", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ access_token: "fresh-token" }));
    const service = new GoogleAccessTokenService(config, fetcher, () => 2_000_000);

    await expect(service.resolve(expiredToken())).resolves.toBe("fresh-token");
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("rejects an expired token without refresh access", async () => {
    const service = new GoogleAccessTokenService(config, vi.fn(), () => 2_000_000);
    await expect(
      service.resolve({ accessToken: "expired-token", accessTokenExpiresAt: 1 }),
    ).resolves.toBeNull();
  });
});

function activeToken() {
  return { accessToken: "active-token", accessTokenExpiresAt: 100, refreshToken: "refresh-token" };
}

function expiredToken() {
  return { accessToken: "expired-token", accessTokenExpiresAt: 1, refreshToken: "refresh-token" };
}
