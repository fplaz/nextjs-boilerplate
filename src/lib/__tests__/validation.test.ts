import { describe, it, expect } from "vitest";
import { isPasswordValid, PASSWORD_RULES } from "@/lib/validation";

describe("isPasswordValid", () => {
  it("returns true for a valid password", () => {
    expect(isPasswordValid("Str0ng!Pass")).toBe(true);
  });

  it("returns false when missing lowercase", () => {
    expect(isPasswordValid("STR0NG!PASS")).toBe(false);
  });

  it("returns false when missing uppercase", () => {
    expect(isPasswordValid("str0ng!pass")).toBe(false);
  });

  it("returns false when missing number", () => {
    expect(isPasswordValid("Strong!Pass")).toBe(false);
  });

  it("returns false when missing special character", () => {
    expect(isPasswordValid("Str0ngPass1")).toBe(false);
  });

  it("returns false when too short", () => {
    expect(isPasswordValid("S1!a")).toBe(false);
  });
});

describe("PASSWORD_RULES", () => {
  it("has 5 rules", () => {
    expect(PASSWORD_RULES).toHaveLength(5);
  });

  it("length rule passes for 8+ chars", () => {
    const rule = PASSWORD_RULES[0];
    expect(rule.test("12345678")).toBe(true);
    expect(rule.test("1234567")).toBe(false);
  });

  it("lowercase rule detects lowercase letters", () => {
    const rule = PASSWORD_RULES[1];
    expect(rule.test("a")).toBe(true);
    expect(rule.test("ABC123")).toBe(false);
  });

  it("uppercase rule detects uppercase letters", () => {
    const rule = PASSWORD_RULES[2];
    expect(rule.test("A")).toBe(true);
    expect(rule.test("abc123")).toBe(false);
  });

  it("number rule detects digits", () => {
    const rule = PASSWORD_RULES[3];
    expect(rule.test("1")).toBe(true);
    expect(rule.test("abcABC")).toBe(false);
  });

  it("special char rule detects non-alphanumeric", () => {
    const rule = PASSWORD_RULES[4];
    expect(rule.test("!")).toBe(true);
    expect(rule.test("abc123ABC")).toBe(false);
  });
});
