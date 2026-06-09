import {
  signUpInput,
  signInInput,
  resetPasswordInput,
} from "../auth.schema";

const validPassword = "StrongP@ss1";

describe("signUpInput", () => {
  it("accepts valid input", () => {
    const result = signUpInput.safeParse({
      email: "user@example.com",
      password: validPassword,
      firstName: "Jane",
      lastName: "Doe",
      accountSlug: "janes-company",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = signUpInput.safeParse({
      email: "not-an-email",
      password: validPassword,
      firstName: "Jane",
      lastName: "Doe",
      accountSlug: "janes-company",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = signUpInput.safeParse({
      email: "user@example.com",
      password: "Ab1!",
      firstName: "Jane",
      lastName: "Doe",
      accountSlug: "janes-company",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/at least 8/);
    }
  });

  it("rejects password without special character", () => {
    const result = signUpInput.safeParse({
      email: "user@example.com",
      password: "StrongPass1",
      firstName: "Jane",
      lastName: "Doe",
      accountSlug: "janes-company",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/special character/);
    }
  });

  it("rejects empty first name", () => {
    const result = signUpInput.safeParse({
      email: "user@example.com",
      password: validPassword,
      firstName: "",
      lastName: "Doe",
      accountSlug: "janes-company",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty account slug", () => {
    const result = signUpInput.safeParse({
      email: "user@example.com",
      password: validPassword,
      firstName: "Jane",
      lastName: "Doe",
      accountSlug: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid slug format", () => {
    const result = signUpInput.safeParse({
      email: "user@example.com",
      password: validPassword,
      firstName: "Jane",
      lastName: "Doe",
      accountSlug: "Invalid Slug!",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid slug", () => {
    const result = signUpInput.safeParse({
      email: "user@example.com",
      password: validPassword,
      firstName: "Jane",
      lastName: "Doe",
      accountSlug: "my-company-123",
    });
    expect(result.success).toBe(true);
  });
});

describe("signInInput", () => {
  it("accepts valid input", () => {
    const result = signInInput.safeParse({
      email: "user@example.com",
      password: "anything",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = signInInput.safeParse({
      email: "bad",
      password: "anything",
    });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordInput", () => {
  it("rejects mismatched passwords", () => {
    const result = resetPasswordInput.safeParse({
      password: validPassword,
      confirmPassword: "Different@1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/do not match/i);
    }
  });

  it("accepts matching strong passwords", () => {
    const result = resetPasswordInput.safeParse({
      password: validPassword,
      confirmPassword: validPassword,
    });
    expect(result.success).toBe(true);
  });
});
