import { describe, expect, it } from "vitest";
import {
  isAllowedCallbackUrl,
  resolveCallbackUrl,
} from "@/lib/auth/callback-url";

describe("callbackUrl allowlist (FR-007)", () => {
  it("allows private prefixes", () => {
    expect(isAllowedCallbackUrl("/dashboard")).toBe(true);
    expect(isAllowedCallbackUrl("/profile/settings")).toBe(true);
    expect(isAllowedCallbackUrl("/interview/1")).toBe(true);
  });

  it("rejects external and protocol-relative URLs", () => {
    expect(isAllowedCallbackUrl("https://evil.example")).toBe(false);
    expect(isAllowedCallbackUrl("//evil.example")).toBe(false);
    expect(isAllowedCallbackUrl("/sign-in")).toBe(false);
  });

  it("falls back to /dashboard when invalid", () => {
    expect(resolveCallbackUrl("https://evil.example")).toBe("/dashboard");
    expect(resolveCallbackUrl("/history")).toBe("/history");
  });
});
