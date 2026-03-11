import { describe, it, expect, beforeEach } from "vitest";
import { isRateLimited, resetRateLimit } from "./rateLimit";

const KEY = "test-ip-192.168.0.1";

describe("isRateLimited", () => {
  beforeEach(() => {
    resetRateLimit(KEY);
  });

  it("最初のリクエストは制限されない", () => {
    expect(isRateLimited(KEY)).toBe(false);
  });

  it("10回目まで制限されない", () => {
    for (let i = 0; i < 10; i++) {
      expect(isRateLimited(KEY)).toBe(false);
    }
  });

  it("11回目で制限される", () => {
    for (let i = 0; i < 10; i++) {
      isRateLimited(KEY);
    }
    expect(isRateLimited(KEY)).toBe(true);
  });

  it("12回目以降も制限される", () => {
    for (let i = 0; i < 11; i++) {
      isRateLimited(KEY);
    }
    expect(isRateLimited(KEY)).toBe(true);
    expect(isRateLimited(KEY)).toBe(true);
  });

  it("リセット後は再び制限されない", () => {
    for (let i = 0; i < 11; i++) {
      isRateLimited(KEY);
    }
    expect(isRateLimited(KEY)).toBe(true);
    resetRateLimit(KEY);
    expect(isRateLimited(KEY)).toBe(false);
  });

  it("別キーは独立して管理される", () => {
    const otherKey = "test-ip-10.0.0.1";
    resetRateLimit(otherKey);

    for (let i = 0; i < 11; i++) {
      isRateLimited(KEY);
    }
    expect(isRateLimited(KEY)).toBe(true);
    expect(isRateLimited(otherKey)).toBe(false);
  });
});
