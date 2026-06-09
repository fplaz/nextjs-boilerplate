import { describe, it, expect } from "vitest";
import {
  updateProfileInput,
  changeEmailInput,
  changePasswordInput,
} from "../user.schema";

describe("updateProfileInput", () => {
  it("parses valid input", () => {
    const result = updateProfileInput.parse({
      firstName: "John",
      lastName: "Doe",
    });
    expect(result.firstName).toBe("John");
    expect(result.lastName).toBe("Doe");
  });

  it("rejects empty first name", () => {
    expect(() =>
      updateProfileInput.parse({ firstName: "", lastName: "Doe" })
    ).toThrow("First name is required");
  });

  it("rejects empty last name", () => {
    expect(() =>
      updateProfileInput.parse({ firstName: "John", lastName: "" })
    ).toThrow("Last name is required");
  });
});

describe("changeEmailInput", () => {
  it("parses valid email", () => {
    const result = changeEmailInput.parse({ email: "test@example.com" });
    expect(result.email).toBe("test@example.com");
  });

  it("rejects invalid email", () => {
    expect(() => changeEmailInput.parse({ email: "not-an-email" })).toThrow();
  });
});

describe("changePasswordInput", () => {
  const valid = {
    currentPassword: "OldPass!1",
    password: "Str0ng!Pass",
    confirmPassword: "Str0ng!Pass",
  };

  it("parses valid input", () => {
    const result = changePasswordInput.parse(valid);
    expect(result.password).toBe("Str0ng!Pass");
  });

  it("rejects weak password (no uppercase)", () => {
    expect(() =>
      changePasswordInput.parse({
        currentPassword: "OldPass!1",
        password: "str0ng!pass",
        confirmPassword: "str0ng!pass",
      })
    ).toThrow("uppercase");
  });

  it("rejects weak password (too short)", () => {
    expect(() =>
      changePasswordInput.parse({
        currentPassword: "OldPass!1",
        password: "S1!a",
        confirmPassword: "S1!a",
      })
    ).toThrow("8 characters");
  });

  it("rejects mismatched passwords", () => {
    expect(() =>
      changePasswordInput.parse({
        currentPassword: "OldPass!1",
        password: "Str0ng!Pass",
        confirmPassword: "Different!1",
      })
    ).toThrow("Passwords do not match");
  });
});
