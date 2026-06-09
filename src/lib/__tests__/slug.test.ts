import { generateSlug, SLUG_REGEX } from "../slug";

describe("generateSlug", () => {
  it("converts name to lowercase slug", () => {
    expect(generateSlug("My Code")).toBe("my-code");
  });

  it("replaces spaces with hyphens", () => {
    expect(generateSlug("hello world test")).toBe("hello-world-test");
  });

  it("removes special characters", () => {
    expect(generateSlug("hello@world!")).toBe("helloworld");
  });

  it("collapses consecutive hyphens", () => {
    expect(generateSlug("hello---world")).toBe("hello-world");
  });

  it("removes leading and trailing hyphens", () => {
    expect(generateSlug("-hello-")).toBe("hello");
  });

  it("converts uppercase to lowercase", () => {
    expect(generateSlug("HELLO")).toBe("hello");
  });

  it("keeps already-valid slug unchanged", () => {
    expect(generateSlug("my-slug")).toBe("my-slug");
  });
});

describe("SLUG_REGEX", () => {
  it("accepts valid slugs", () => {
    expect(SLUG_REGEX.test("my-company")).toBe(true);
    expect(SLUG_REGEX.test("abc123")).toBe(true);
    expect(SLUG_REGEX.test("a")).toBe(true);
    expect(SLUG_REGEX.test("test-slug-123")).toBe(true);
  });

  it("rejects invalid slugs", () => {
    expect(SLUG_REGEX.test("")).toBe(false);
    expect(SLUG_REGEX.test("-leading")).toBe(false);
    expect(SLUG_REGEX.test("trailing-")).toBe(false);
    expect(SLUG_REGEX.test("double--hyphen")).toBe(false);
    expect(SLUG_REGEX.test("UPPERCASE")).toBe(false);
    expect(SLUG_REGEX.test("has space")).toBe(false);
    expect(SLUG_REGEX.test("special@char")).toBe(false);
  });
});
